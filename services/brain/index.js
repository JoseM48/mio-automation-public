// --- Imports ---
import express from 'express';
import axios from 'axios';

// --- Config básica ---
const app = express();
app.use(express.json());

const PORT = process.env.PORT || process.env.BRAIN_PORT || 3010;
// Local ahora; si luego usas Docker Compose, podrás setear: JOBS_URL=http://jobs:3020
const JOBS_URL = process.env.JOBS_URL || 'http://localhost:3020';

// --- Healthcheck ---
app.get('/health', (_req, res) => res.json({ ok: true, service: 'brain' }));

// --- Helpers de parsing ---
function extractPhone(text) {
  const re = /(?:\+?\d{1,3}\s*)?(?:\d{1,4}\s*)?(?:\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{3,4})?)/g;
  const raw = text || '';
  const candidates = raw.match(re) || [];

  const normalized = candidates
    .map(s => ({
      raw: s,
      hasPlus: /\+/.test(s),
      clean: s.replace(/[^\d+]/g, '').replace(/^0+(?=\d)/, ''),
    }))
    .filter(o => o.clean.replace(/\D/g, '').length >= 7);

  if (!normalized.length) return null;

  const withPlus = normalized.filter(o => o.hasPlus);
  if (withPlus.length) {
    withPlus.sort((a, b) => b.clean.length - a.clean.length);
    return withPlus[0].clean;
  }

  normalized.sort((a, b) => b.clean.length - a.clean.length);
  return normalized[0].clean;
}

function extractDates(subject, body) {
  const text = `${subject || ''} ${body || ''}`.replaceAll('\n', ' ');

  // Rango "dd/mm al dd/mm[/yyyy]"
  let m = text.match(/(\d{1,2}\/\d{1,2})(?:\/(\d{2,4}))?\s*(?:al|-|–|a)\s*(\d{1,2}\/\d{1,2})(?:\/(\d{2,4}))?/i);
  if (m) {
    const [, d1, y1, d2, y2] = m;
    const year = y1 || y2 || new Date().getFullYear();
    const [d1d, d1m] = d1.split('/').map(Number);
    const [d2d, d2m] = d2.split('/').map(Number);
    const start = new Date(year, d1m - 1, d1d);
    const end = new Date(y2 ? Number(y2) : year, d2m - 1, d2d);
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    };
  }

  // “Entrada dd/mm … Salida dd/mm”
  m = text.match(/entrada\s+(\d{1,2}\/\d{1,2})(?:\/(\d{2,4}))?.*salida\s+(\d{1,2}\/\d{1,2})(?:\/(\d{2,4}))?/i);
  if (m) {
    const [, d1, y1, d2, y2] = m;
    const year = y1 || y2 || new Date().getFullYear();
    const [d1d, d1m] = d1.split('/').map(Number);
    const [d2d, d2m] = d2.split('/').map(Number);
    const start = new Date(year, d1m - 1, d1d);
    const end = new Date(y2 ? Number(y2) : year, d2m - 1, d2d);
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    };
  }

  return { start_date: null, end_date: null };
}

function extractGuestName(subject, body) {
  const s = subject || '';
  const b = body || '';
  let m = s.match(/reserva\s*[–-]\s*([^–-]+)\s*[–-]/i);
  if (m) return m[1].trim();
  m = (s + ' ' + b).match(/a nombre de[:\s]+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’\s.-]{3,})/i);
  if (m) return m[1].trim();
  return null;
}

function extractRoomType(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('habitación doble') || lower.includes('doble')) return 'doble';
  if (lower.includes('habitación triple') || lower.includes('triple')) return 'triple';
  if (lower.includes('habitación simple') || lower.includes('simple') || lower.includes('single')) return 'simple';
  if (lower.includes('suite')) return 'suite';
  return null;
}

function parseEmail({ from, subject, body }) {
  const phone = extractPhone(body || subject || '');
  const { start_date, end_date } = extractDates(subject || '', body || '');
  const guest_name = extractGuestName(subject || '', body || '');
  const room_type = extractRoomType(body || '');
  return {
    ok: true,
    from: from || null,
    guest_name,
    phone,
    start_date,
    end_date,
    room_type,
    raw: { subject, body },
  };
}

// --- Endpoints de utilidad ---
app.post('/answer', (req, res) => {
  const { question } = req.body || {};
  res.json({ ok: true, answer: `Placeholder para: ${question ?? 'N/A'}` });
});

app.post('/ingest-email', (req, res) => {
  const data = parseEmail(req.body || {});
  return res.json(data);
});

// --- Despacho a Jobs ---
app.post('/dispatch-email', async (req, res) => {
  try {
    const parsed = parseEmail(req.body || {});
    const job = {
      guest_name: parsed.guest_name,
      phone: parsed.phone,
      start_date: parsed.start_date,
      end_date: parsed.end_date,
      room_type: parsed.room_type,
      source: 'email',
    };
    const r = await axios.post(`${JOBS_URL}/enqueue`, job, { timeout: 10000 });
    return res.json({ ok: true, parsed, jobs_response: r.data });
  } catch (err) {
    console.error('[brain] error en /dispatch-email', err?.message || err);
    return res.status(500).json({ ok: false, error: 'dispatch_failed' });
  }
});

// --- Boot ---
app.listen(PORT, () => {
  console.log(`[brain] Servicio Brain escuchando en http://localhost:${PORT}`);
});
