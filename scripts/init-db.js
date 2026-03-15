const fs   = require('fs');
const path = require('path');
const db   = require('../config/database');

const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
db.exec(schema);
console.log('✅ Database initialized successfully');
process.exit(0);
