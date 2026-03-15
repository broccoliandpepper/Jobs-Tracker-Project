const { validateJob } = require('../utils/validators');

const dal = require('../dal/jobs.dal');

const aiService = require('./ai.service');

const getAllJobs = (filters = {}) => dal.findAll(filters);

const getJobById = (id) => {
  const job = dal.findById(id);
  if (!job) throw new Error('Job not found');
  return job;
};

const createJob = (data) => {
  const errors = validateJob(data, false);
  if (errors) throw new Error('Validation failed: ' + errors.join(', '));
  return dal.create({
    job_title:         data.job_title,
    company:           data.company,
    sector:            data.sector            || null,
    contract_type:     data.contract_type     || null,
    location:          data.location          || null,
    remote:            data.remote            || null,
    source_url:        data.source_url        || null,
    source_platform:   data.source_platform   || null,
    status:            data.status            || 'ToApply',
    contact_name:      data.contact_name      || null,
    contact_email:     data.contact_email     || null,
    salary_range:      data.salary_range      || null,
    fit_score:         data.fit_score         || null,
    fake_flag:         data.fake_flag         || 0,
    notes:             data.notes             || null,
    rejection_date:    data.rejection_date    || null,
    cover_letter_path: data.cover_letter_path || null,
  });
};


const updateJob = (id, data) => {
  const errors = validateJob(data, true);
  if (errors) throw new Error('Validation failed: ' + errors.join(', '));
  getJobById(id);
  return dal.update(id, data);
};


const deleteJob = (id) => {
  getJobById(id); // lève 404 si inexistant
  return dal.deleteById(id);
};

const getStats = () => dal.getStats();

const HEADERS = [
  'id', 'date_added', 'last_updated', 'job_title', 'company', 'sector',
  'contract_type', 'location', 'remote', 'source_url', 'source_platform',
  'status', 'contact_name', 'contact_email', 'salary_range', 'fit_score',
  'fake_flag', 'notes', 'rejection_date', 'cover_letter_path'
];

const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const exportToCSV = () => {
  const jobs = dal.findAll();
  const header = HEADERS.join(',');
  const rows = jobs.map(job =>
    HEADERS.map(col => escapeCsvCell(job[col])).join(',')
  );
  return '\uFEFF' + header + '\n' + rows.join('\n');
};

// Parser CSV gère les guillemets et virgules dans les cellules
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
};

const SKIP_COLS  = ['id', 'date_added', 'last_updated'];
const NUM_COLS   = ['fit_score', 'fake_flag'];

const importFromCSV = (csvContent) => {
  const content = csvContent.replace(/^\uFEFF/, '').replace(/\r/g, '');
  const lines   = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV vide ou sans données');

  const headers  = parseCSVLine(lines[0]);
  const warnings = [];
  const errors   = [];
  const toInsert = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const values  = parseCSVLine(lines[i]);

    if (values.length !== headers.length) {
      errors.push(`Ligne ${lineNum}: ${values.length} colonnes trouvées, ${headers.length} attendues`);
      continue;
    }

    // Construire l'objet data
    const raw = {};
    headers.forEach((h, idx) => {
      if (!SKIP_COLS.includes(h)) {
        raw[h] = values[idx] === '' ? null : values[idx];
      }
    });

    // Convertir les champs numériques
    NUM_COLS.forEach(col => {
      if (raw[col] !== null && raw[col] !== undefined)
        raw[col] = parseInt(raw[col]) || null;
    });
    if (raw.fake_flag === null) raw.fake_flag = 0;

    // Validation
    const validationErrors = validateJob(raw, false);
    if (validationErrors) {
      errors.push(`Ligne ${lineNum} (${raw.job_title || '?'} @ ${raw.company || '?'}): ${validationErrors.join(', ')}`);
      continue;
    }

    // Détection doublon
    const duplicate = dal.findByTitleAndCompany(raw.job_title, raw.company);
    if (duplicate) {
      warnings.push(`Ligne ${lineNum}: doublon détecté (${raw.job_title} @ ${raw.company}, id existant: ${duplicate.id}) — importé quand même`);
    }

    // Normaliser les champs manquants
    toInsert.push({
      job_title:         raw.job_title,
      company:           raw.company,
      sector:            raw.sector            || null,
      contract_type:     raw.contract_type     || null,
      location:          raw.location          || null,
      remote:            raw.remote            || null,
      source_url:        raw.source_url        || null,
      source_platform:   raw.source_platform   || null,
      status:            raw.status            || 'ToApply',
      contact_name:      raw.contact_name      || null,
      contact_email:     raw.contact_email     || null,
      salary_range:      raw.salary_range      || null,
      fit_score:         raw.fit_score         || null,
      fake_flag:         raw.fake_flag         || 0,
      notes:             raw.notes             || null,
      rejection_date:    raw.rejection_date    || null,
      cover_letter_path: raw.cover_letter_path || null,
    });
  }

  if (toInsert.length > 0) dal.createMany(toInsert);

  return { inserted: toInsert.length, warnings, errors };
};

const analyzeWithAI = async (id) => {
  const job = getJobById(id);
  const model = process.env.OLLAMA_MODEL || 'llama3';

  try {
    const result = await aiService.analyzeFitScore(job, model);
    return {
      jobId: id,
      score: result.score,
      reasoning: result.reasoning,
      model,
    };
  } catch (error) {
    throw new Error(`Analyse IA échouée : ${error.message}`);
  }
};

const detectFakeWithAI = async (id) => {
  const job = getJobById(id);
  const model = process.env.OLLAMA_MODEL || 'llama3';

  try {
    const result = await aiService.detectFake(job, model);
    return {
      jobId: id,
      isFake: result.isFake,
      confidence: result.confidence,
      reasons: result.reasons,
      model,
    };
  } catch (error) {
    throw new Error(`Détection fake échouée : ${error.message}`);
  }
};


module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  exportToCSV,
  analyzeWithAI,       // NOUVEAU
  detectFakeWithAI,    // NOUVEAU
};

