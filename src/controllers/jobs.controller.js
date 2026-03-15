const service = require('../services/jobs.service');

const getAll = (req, res) => {
  try {
    const filters = {
      status:     req.query.status,
      sector:     req.query.sector,
      remote:     req.query.remote,
      fake_flag:  req.query.fake_flag !== undefined ? parseInt(req.query.fake_flag) : undefined,
      search:     req.query.search,
      sort_by:    req.query.sort_by,
      sort_order: req.query.sort_order,
    };
    const data = service.getAllJobs(filters);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getOne = (req, res) => {
  try {
    const data = service.getJobById(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

const create = (req, res) => {
  try {
    const data = service.createJob(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const update = (req, res) => {
  try {
    const data = service.updateJob(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message === 'Job not found' ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
};

const remove = (req, res) => {
  try {
    service.deleteJob(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

const getStats = (req, res) => {
  try {
    const data = service.getStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const importCsv = (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ success: false, error: 'csvContent manquant' });
    const result = service.importFromCSV(csvContent);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const exportCsv = (req, res) => {
  try {
    const csv = service.exportToCSV();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="jobtracker_${date}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const analyze = async (req, res) => {
  try {
    const data = await service.analyzeWithAI(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes('not found') ? 404 : 500;
    res.status(code).json({ success: false, error: err.message });
  }
};

const detectFake = async (req, res) => {
  try {
    const data = await service.detectFakeWithAI(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    const code = err.message.includes('not found') ? 404 : 500;
    res.status(code).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getStats,
  exportCsv,
  analyze,      // NOUVEAU
  detectFake,   // NOUVEAU
  importCsv,
};

