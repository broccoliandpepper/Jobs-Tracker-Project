const service = require('../services/backup.service');

const triggerBackup = (req, res) => {
  try {
    const result = service.triggerBackup();
    res.json({
      success: true,
      data: {
        filename: result.filename,
        size: result.size,
        duration: result.duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = { triggerBackup };
