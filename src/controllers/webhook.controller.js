const webhookService = require('../services/webhook.service');
const webhookDal = require('../dal/webhook.dal');

const receiveWebhook = (req, res) => {
  const payload = req.body;
  const sourceIp = req.ip || req.connection.remoteAddress;
  const token = req.headers['x-webhook-token'];

  try {
    const job = webhookService.processWebhook(payload, sourceIp, token);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    webhookService.logWebhookError(payload, sourceIp, error);

    if (error.message === 'Webhook disabled') {
      return res.status(503).json({ success: false, error: 'Webhook disabled' });
    }
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

const getLogs = (req, res) => {
  try {
    const logs = webhookDal.getLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const clearLogs = (req, res) => {
  try {
    webhookDal.clearLogs();
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const ping = (req, res) => {
  const ENABLE_WEBHOOK = process.env.ENABLE_WEBHOOK === 'true';
  const N8N_MODE = process.env.N8N_MODE || 'local';
  const PORT = process.env.PORT || 3333;
  const N8N_CUSTOM_IP = process.env.N8N_CUSTOM_IP || '';

  let url = '';
  switch (N8N_MODE) {
    case 'docker-mac':
      url = `http://host.docker.internal:${PORT}/api/jobs/webhook`;
      break;
    case 'docker-linux':
      url = `http://172.17.0.1:${PORT}/api/jobs/webhook`;
      break;
    case 'docker-custom':
      url = `http://${N8N_CUSTOM_IP}:${PORT}/api/jobs/webhook`;
      break;
    default:
      url = `http://localhost:${PORT}/api/jobs/webhook`;
  }

  const lastCall = webhookDal.getLastCall();

  res.json({
    status: ENABLE_WEBHOOK ? 'ok' : 'disabled',
    mode: N8N_MODE,
    url,
    lastCall: lastCall ? lastCall.received_at : null,
  });
};

module.exports = { receiveWebhook, getLogs, clearLogs, ping };
