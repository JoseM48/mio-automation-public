import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.JOBS_PORT || 3020;

// Encolar trabajo
app.post('/enqueue', async (req, res) => {
  try {
    const payload = req.body || {};
    const { guest_name, phone, start_date, end_date, room_type, source } = payload;

    // Validación mínima
    const missing = [];
    if (!guest_name) missing.push('guest_name');
    if (!phone) missing.push('phone');
    if (!start_date) missing.push('start_date');
    if (!end_date) missing.push('end_date');
    if (missing.length) {
      console.warn('[jobs] payload incompleto:', { missing, payload });
      return res.status(400).json({ ok: false, error: 'missing_fields', missing });
    }

    console.log('[jobs] job recibido ✅', {
      guest_name, phone, start_date, end_date, room_type, source
    });

    // Aquí iría la integración real con hr-phone-worker / HotelRunner / WhatsApp.
    setTimeout(() => {
      console.log('[jobs] procesado (simulado) → buscar teléfono en HR y enviar WhatsApp…');
    }, 150);

    return res.json({ ok: true, queued: true });
  } catch (err) {
    console.error('[jobs] error en /enqueue', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

app.listen(PORT, () => {
  console.log(`[jobs] listening on :\${PORT}`);
});
