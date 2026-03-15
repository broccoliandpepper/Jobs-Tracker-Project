require('dotenv').config();
const db = require('../config/database');

const sectors = ['IT', 'Finance', 'Marketing', 'RH', 'Legal', 'Engineering', 'Sales', 'Other'];
const statuses = ['ToApply', 'Applied', 'PhoneScreen', 'Interview', 'Offer', 'Rejected'];
const remotes = ['Remote', 'Hybrid', 'On-site'];

const stmt = db.prepare(`
  INSERT INTO job_applications (job_title, company, sector, status, remote, location, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insert = db.transaction(() => {
  for (let i = 1; i <= 5000; i++) {
    stmt.run(
      `Job Title ${i}`,
      `Company ${i}`,
      sectors[i % sectors.length],
      statuses[i % statuses.length],
      remotes[i % remotes.length],
      `City ${i}`,
      `Seed data entry ${i} — generated for performance testing`
    );
  }
});

insert();
console.log('✅ 5000 candidatures créées pour les tests de performance');
