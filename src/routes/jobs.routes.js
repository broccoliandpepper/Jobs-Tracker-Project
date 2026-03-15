const router = require('express').Router();
const controller = require('../controllers/jobs.controller');
const webhookController = require('../controllers/webhook.controller'); // NOUVEAU

router.get('/stats', controller.getStats);
router.get('/export', controller.exportCsv);
router.post('/webhook', webhookController.receiveWebhook); // NOUVEAU — avant /:id
router.get('/:id', controller.getOne);
router.post('/:id/analyze', controller.analyze);
router.post('/:id/detect-fake', controller.detectFake);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
