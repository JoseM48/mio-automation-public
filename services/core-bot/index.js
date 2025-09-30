import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const META_TOKEN = process.env.META_WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'dev-verify-token';

// Verificación de webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepción de mensajes (POST)
app.post('/webhook', async (req, res) => {
  console.log('Webhook payload:', JSON.stringify(req.body, null, 2));
  // TODO: parsear mensajes y delegar a brain si aplica.
  res.sendStatus(200);
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'core-bot' }));

app.listen(PORT, () => {
  console.log(`[core-bot] listening on :${PORT}`);
});
