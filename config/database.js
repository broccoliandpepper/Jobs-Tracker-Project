require('dotenv').config();
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_PATH || './jobs.db');
db.pragma('journal_mode = WAL');

module.exports = db;