const fs   = require('fs');
const path = require('path');
const db   = require('../config/database');

console.log('⚠️  Clearing existing data...');
db.prepare('DELETE FROM job_applications').run();

const seed = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');
db.exec(seed);

const { n } = db.prepare('SELECT COUNT(*) as n FROM job_applications').get();
console.log(`✅ ${n} candidatures insérées.`);
process.exit(0);
