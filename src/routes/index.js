const router = require('express').Router();

router.use('/jobs', require('./jobs.routes'));

module.exports = router;
