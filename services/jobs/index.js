import 'dotenv/config';
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || process.env.JOBS_PORT || 3020; // 👈 Consistente

// ================================
// Cola en memoria (simple y efectiva)
// ================================
const queue = [];
let isProcessing = false;

// ================================
// Utilidades
// ================================
function onlyDigits(s = '') {
  return (s || '').replace(/[^\d]/g, '');
}

function normalizePhone(raw, defaultCc = process.env.DEFAULT_CC || '57') {
  // Devuelve E.164 sin '+', solo dígitos. Ej: "573001112233"
  const digits = onlyDigits(raw);
  if (!digits) return null;

  // Si ya parece traer CC (>=11 dígitos, <=15)
  if (digits.length >= 11 && digits.length <= 15) return digits;

  // Si llega con 10 dígitos (CO), anteponer CC
  if (digits.length === 10) return `${defaultCc}${digits}`;

  // Si llega muy corto/largo, devolver tal cual (WABA validará)
  return digits;
}

async function sendWhatsAppText({ to, body }) {
  const token = process.env.WABA_TOKEN;
  const phoneNumberId = process.env.WABA_PHONE_NUMBER_ID;
  const base = process.env.WABA_API_BASE || 'https://graph.facebook.com/v21.0';

  if (!token || !phoneNumberId) {
    throw new Error('missing_whatsapp_env');
  }

  const url = `${base}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  return res.data;
}

function buildGreeting(job) {
  const name = job.guest_name ? ` ${job.guest_name}` : '';
  const dates = (job.start_date && job.end_date)
    ? ` del ${job.start_date} al ${job.end_date}`
    : '';
  const src = job.source ? ` (${job.source})` : '';
  return `Hola${name}, te escribe Mio La Frontera${src}. Tenemos registrada tu reserva${dates}. ` +
         `¿Te puedo asistir con tu check-in o alguna pregunta?`;
}

// ================================
// Worker
// ================================
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length) {
    const job = queue.shift();
    try {
      const to = normalizePhone(job.phone);
      if (!to) throw new Error('invalid_phone');

      const body = job.message || buildGreeting(job);
      const result = await sendWhatsAppText({ to, body });

      console.log('[jobs] enviado OK →', to, result?.messages?.[0]?.id || '');
      job._status = 'sent';
      job._result = result;
    } catch (err) {
      job._retries = (job._retries || 0) + 1;
      job._status = 'failed';
      job._error = err?.response?.data || err?.message || String(err);

      console.error('[jobs] error al enviar', {
        msg: err?.message,
        data: err?.response?.data,
        to: job?.phone,
        retries: job?._retries
      });

      if (job._retries < 3) {
        setTimeout(() => queue.push(job), 2000 * job._retries); // backoff lineal
      } else {
        console.error('[jobs] agotados reintentos para', job?.phone);
      }
    }
  }

  isProcessing = false;
}

// Ejecutar el worker cada 1s
setInterval(processQueue, 1000);

// ================================
// API
// ================================
app.get('/health', (_req, res) => res.json({ ok: true, service: 'jobs' }));

app.post('/enqueue', (req, res) => {
  const job = req.body || {};
  if (!job?.phone && !job?.guest_phone) {
    return res.status(400).json({ ok: false, error: 'phone_required' });
  }
  job.phone = job.phone || job.guest_phone;
  job._ts = Date.now();
  queue.push(job);

  return res.json({ ok: true, queued: true, size: queue.length });
});

function mask(s, show = 6) {
  if (!s) return s;
  return s.slice(0, show) + '...' + s.slice(-4);
}
console.log('[jobs] ENV OK', {
  PHONE_NUMBER_ID: process.env.WABA_PHONE_NUMBER_ID,
  TOKEN_LEN: (process.env.WABA_TOKEN || '').length,
  TOKEN_PREFIX: (process.env.WABA_TOKEN || '').slice(0, 4),
  API_BASE: process.env.WABA_API_BASE
});


app.listen(PORT, () => {
  console.log(`[jobs] listening on :${PORT}`);
});