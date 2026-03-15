const db = require('../../config/database');

const createLog = (data) => {
  const stmt = db.prepare(`
    INSERT INTO webhook_logs (source_ip, n8n_mode, payload_preview, status, error, job_id)
    VALUES (@sourceIp, @n8nMode, @payloadPreview, @status, @error, @jobId)
  `);
  const result = stmt.run({
    sourceIp: data.sourceIp || null,
    n8nMode: data.n8nMode || null,
    payloadPreview: data.payloadPreview || null,
    status: data.status,
    error: data.error || null,
    jobId: data.jobId || null,
  });
  return result.lastInsertRowid;
};

const getLogs = () =>
  db.prepare('SELECT * FROM webhook_logs ORDER BY received_at DESC LIMIT 30').all();

const clearLogs = () =>
  db.prepare('DELETE FROM webhook_logs').run();

const purgeLogs = () =>
  db.prepare(`
    DELETE FROM webhook_logs WHERE id NOT IN (
      SELECT id FROM webhook_logs ORDER BY received_at DESC LIMIT 30
    )
  `).run();

const getLastCall = () =>
  db.prepare(`
    SELECT received_at FROM webhook_logs
    WHERE status = 'inserted'
    ORDER BY received_at DESC LIMIT 1
  `).get();

module.exports = { createLog, getLogs, clearLogs, purgeLogs, getLastCall };
