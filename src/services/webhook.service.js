require('dotenv').config();
const crypto = require('crypto');
const jobsDal = require('../dal/jobs.dal');
const webhookDal = require('../dal/webhook.dal');

const ENABLE_WEBHOOK = process.env.ENABLE_WEBHOOK === 'true';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const N8N_MODE = process.env.N8N_MODE || 'local';

const validateToken = (receivedToken) => {
  if (!WEBHOOK_SECRET) return true;
  if (!receivedToken) return false;
  const expectedHash = crypto.createHash('sha256').update(WEBHOOK_SECRET).digest('hex');
  const receivedHash = crypto.createHash('sha256').update(receivedToken).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, 'hex'),
    Buffer.from(receivedHash, 'hex')
  );
};

const processWebhook = (payload, sourceIp, token) => {
  if (!ENABLE_WEBHOOK) throw new Error('Webhook disabled');
  if (!validateToken(token)) throw new Error('Unauthorized');
  if (!payload.job_title && !payload.jobtitle) throw new Error('job_title and company are required');
  if (!payload.company) throw new Error('job_title and company are required');

  // Mapper les noms n8n (sans underscore) vers les colonnes DB
  const jobData = {
    job_title:        payload.job_title || payload.jobtitle,
    company:          payload.company,
    sector:           payload.sector || null,
    contract_type:    payload.contract_type || payload.contracttype || null,
    location:         payload.location || null,
    remote:           payload.remote || null,
    source_url:       payload.source_url || payload.sourceurl || null,
    source_platform:  payload.source_platform || payload.sourceplatform || null,
    status:           payload.status || 'ToApply',
    contact_name:     payload.contact_name || payload.contactname || null,
    contact_email:    payload.contact_email || payload.contactemail || null,
    salary_range:     payload.salary_range || payload.salaryrange || null,
    fit_score:        payload.fit_score || payload.fitscore || null,
    fake_flag:        payload.fake_flag || payload.fakeflag || 0,
    notes:            payload.notes || null,
    rejection_date:   payload.rejection_date || payload.rejectiondate || null,
    cover_letter_path: payload.cover_letter_path || payload.coverletterpath || null,
  };

  const job = jobsDal.create(jobData);

  const payloadPreview = JSON.stringify(payload).substring(0, 200);
  webhookDal.createLog({
    sourceIp,
    n8nMode: N8N_MODE,
    payloadPreview,
    status: 'inserted',
    error: null,
    jobId: job.id,
  });
  webhookDal.purgeLogs();

  return job;
};

const logWebhookError = (payload, sourceIp, error) => {
  const payloadPreview = JSON.stringify(payload).substring(0, 200);
  webhookDal.createLog({
    sourceIp,
    n8nMode: N8N_MODE,
    payloadPreview,
    status: 'rejected',
    error: error.message,
    jobId: null,
  });
  webhookDal.purgeLogs();
};

module.exports = { processWebhook, logWebhookError };
