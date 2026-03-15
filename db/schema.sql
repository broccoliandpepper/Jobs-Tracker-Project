CREATE TABLE IF NOT EXISTS job_applications (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  date_added        TEXT    NOT NULL DEFAULT (datetime('now')),
  last_updated      TEXT    NOT NULL DEFAULT (datetime('now')),
  job_title         TEXT    NOT NULL,
  company           TEXT    NOT NULL,
  sector            TEXT    CHECK(sector IN ('IT','Finance','Marketing','RH','Legal','Engineering','Sales','Other')),
  contract_type     TEXT    CHECK(contract_type IN ('CDI','CDD','Freelance','Internship','Apprenticeship','Other')),
  location          TEXT,
  remote            TEXT    CHECK(remote IN ('Remote','Hybrid','On-site')),
  source_url        TEXT,
  source_platform   TEXT,
  status            TEXT    NOT NULL DEFAULT 'ToApply'
                            CHECK(status IN ('ToApply','Applied','PhoneScreen','Interview','Offer','Rejected','Withdrawn')),
  contact_name      TEXT,
  contact_email     TEXT,
  salary_range      TEXT,
  fit_score         INTEGER CHECK(fit_score BETWEEN 1 AND 10),
  fake_flag         INTEGER NOT NULL DEFAULT 0 CHECK(fake_flag IN (0,1)),
  notes             TEXT,
  rejection_date    TEXT,
  cover_letter_path TEXT
);

-- Trigger auto-update last_updated
CREATE TRIGGER IF NOT EXISTS update_last_updated
AFTER UPDATE ON job_applications
FOR EACH ROW BEGIN
  UPDATE job_applications SET last_updated = datetime('now') WHERE id = OLD.id;
END;

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_status     ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_sector     ON job_applications(sector);
CREATE INDEX IF NOT EXISTS idx_date_added ON job_applications(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_fake_flag  ON job_applications(fake_flag);

-- Phase 2 - Table webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_ip TEXT,
  n8n_mode TEXT,
  payload_preview TEXT,
  status TEXT NOT NULL,
  error TEXT,
  job_id INTEGER,
  FOREIGN KEY (job_id) REFERENCES job_applications(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_date ON webhook_logs(received_at DESC);
