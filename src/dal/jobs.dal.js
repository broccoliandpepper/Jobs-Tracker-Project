const db = require('../../config/database');

const ALLOWED_SORT = ['date_added', 'last_updated', 'fit_score', 'company', 'job_title'];

const findAll = (filters = {}) => {
  const conditions = [];
  const params = {};

  if (filters.status) {
    conditions.push('status = @status');
    params.status = filters.status;
  }
  if (filters.sector) {
    conditions.push('sector = @sector');
    params.sector = filters.sector;
  }
  if (filters.remote) {
    conditions.push('remote = @remote');
    params.remote = filters.remote;
  }
  if (filters.fake_flag !== undefined) {
    conditions.push('fake_flag = @fake_flag');
    params.fake_flag = filters.fake_flag;
  }
  if (filters.search) {
    conditions.push('(job_title LIKE @search OR company LIKE @search OR notes LIKE @search)');
    params.search = `%${filters.search}%`;
  }

  const where    = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const sortBy   = ALLOWED_SORT.includes(filters.sort_by) ? filters.sort_by : 'date_added';
  const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';

  return db.prepare(
    `SELECT * FROM job_applications ${where} ORDER BY ${sortBy} ${sortOrder}`
  ).all(params);
};

const findById = (id) =>
  db.prepare('SELECT * FROM job_applications WHERE id = ?').get(id);

const create = (data) => {
  const stmt = db.prepare(`
    INSERT INTO job_applications
      (job_title, company, sector, contract_type, location, remote,
       source_url, source_platform, status, contact_name, contact_email,
       salary_range, fit_score, fake_flag, notes, rejection_date, cover_letter_path)
    VALUES
      (@job_title, @company, @sector, @contract_type, @location, @remote,
       @source_url, @source_platform, @status, @contact_name, @contact_email,
       @salary_range, @fit_score, @fake_flag, @notes, @rejection_date, @cover_letter_path)
  `);
  const result = stmt.run(data);
  return findById(result.lastInsertRowid);
};

const update = (id, data) => {
  const fields = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  db.prepare(`UPDATE job_applications SET ${fields} WHERE id = @id`).run({ ...data, id });
  return findById(id);
};

const deleteById = (id) =>
  db.prepare('DELETE FROM job_applications WHERE id = ?').run(id);

const getStats = () => {
  const totals = db.prepare(
    'SELECT COUNT(*) as total, ROUND(AVG(fit_score),2) as avg_fit, SUM(fake_flag) as fakes FROM job_applications'
  ).get();
  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM job_applications GROUP BY status'
  ).all();
  const bySector = db.prepare(
    'SELECT sector, COUNT(*) as count FROM job_applications GROUP BY sector'
  ).all();

  return {
    total_applications: totals.total,
    average_fit_score:  totals.avg_fit,
    fake_applications:  totals.fakes,
    by_status: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
    by_sector: Object.fromEntries(bySector.map(r => [r.sector, r.count])),
  };
};

const findByTitleAndCompany = (job_title, company) =>
  db.prepare(
    'SELECT id FROM job_applications WHERE job_title = ? AND company = ?'
  ).get(job_title, company);

const createMany = (rows) => {
  const stmt = db.prepare(`
    INSERT INTO job_applications
      (job_title, company, sector, contract_type, location, remote,
       source_url, source_platform, status, contact_name, contact_email,
       salary_range, fit_score, fake_flag, notes, rejection_date, cover_letter_path)
    VALUES
      (@job_title, @company, @sector, @contract_type, @location, @remote,
       @source_url, @source_platform, @status, @contact_name, @contact_email,
       @salary_range, @fit_score, @fake_flag, @notes, @rejection_date, @cover_letter_path)
  `);
  const insertAll = db.transaction((rows) => rows.forEach(r => stmt.run(r)));
  insertAll(rows);
};


module.exports = { findAll, findById, create, update, deleteById, getStats, findByTitleAndCompany, createMany };

