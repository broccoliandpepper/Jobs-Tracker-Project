const router = require('express').Router();
const aiService = require('../services/ai.service');

router.get('/models', async (req, res) => {
  try {
    const models = await aiService.getAvailableModels();
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(503).json({ success: false, error: error.message });
  }
});

module.exports = router;
