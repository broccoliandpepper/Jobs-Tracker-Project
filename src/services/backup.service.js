const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './jobs.db';
const BACKUP_DIR = './db-backup';
const BACKUP_RETENTION = parseInt(process.env.BACKUP_RETENTION || '10', 10);

const triggerBackup = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '');
  const backupFilename = `jobs_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);

  const startTime = Date.now();
  fs.copyFileSync(DB_PATH, backupPath);
  const duration = Date.now() - startTime;

  if (BACKUP_RETENTION > 0) {
    cleanOldBackups();
  }

  return {
    filename: backupFilename,
    path: backupPath,
    size: fs.statSync(backupPath).size,
    duration,
  };
};

const cleanOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('jobs_') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length > BACKUP_RETENTION) {
    files.slice(BACKUP_RETENTION).forEach(file => {
      fs.unlinkSync(file.path);
    });
  }
};

module.exports = { triggerBackup };
