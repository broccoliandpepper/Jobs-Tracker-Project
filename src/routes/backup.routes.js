const router = require('express').Router();
const controller = require('../controllers/backup.controller');

router.get('/', controller.triggerBackup);

module.exports = router;
