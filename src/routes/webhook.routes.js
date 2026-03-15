const router = require('express').Router();
const controller = require('../controllers/webhook.controller');

router.get('/ping', controller.ping);
router.get('/logs', controller.getLogs);
router.delete('/logs', controller.clearLogs);

module.exports = router;
