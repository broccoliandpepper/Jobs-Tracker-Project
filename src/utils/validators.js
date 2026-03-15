const VALID_STATUSES = ['ToApply', 'Applied', 'PhoneScreen', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const VALID_SECTORS  = ['IT', 'Finance', 'Marketing', 'RH', 'Legal', 'Engineering', 'Sales', 'Other'];
const VALID_CONTRACT_TYPES = ['CDI', 'CDD', 'Freelance', 'Internship', 'Apprenticeship', 'Other'];
const VALID_REMOTES  = ['Remote', 'Hybrid', 'On-site'];

const validateJob = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    if (!data.job_title?.trim()) errors.push('job_title is required');
    if (!data.company?.trim())   errors.push('company is required');
    if (!data.status)            errors.push('status is required');
  }

  if (data.status && !VALID_STATUSES.includes(data.status))
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);

  if (data.sector && !VALID_SECTORS.includes(data.sector))
    errors.push(`sector must be one of: ${VALID_SECTORS.join(', ')}`);

  if (data.contract_type && !VALID_CONTRACT_TYPES.includes(data.contract_type))
    errors.push(`contract_type must be one of: ${VALID_CONTRACT_TYPES.join(', ')}`);

  if (data.remote && !VALID_REMOTES.includes(data.remote))
    errors.push(`remote must be one of: ${VALID_REMOTES.join(', ')}`);

  if (data.fit_score !== undefined && data.fit_score !== null) {
    const score = Number(data.fit_score);
    if (!Number.isInteger(score) || score < 1 || score > 10)
      errors.push('fit_score must be an integer between 1 and 10');
  }

  if (data.fake_flag !== undefined && data.fake_flag !== null) {
    if (![0, 1].includes(Number(data.fake_flag)))
      errors.push('fake_flag must be 0 or 1');
  }

  return errors.length ? errors : null;
};

module.exports = { validateJob, VALID_STATUSES, VALID_SECTORS, VALID_CONTRACT_TYPES, VALID_REMOTES };
