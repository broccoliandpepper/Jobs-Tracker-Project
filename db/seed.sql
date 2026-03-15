DELETE FROM job_applications;

INSERT INTO job_applications (job_title, company, sector, contract_type, location, remote, source_platform, status, fit_score, notes, fake_flag)
VALUES
  ('M365 Security Engineer', 'Microsoft Belgium', 'IT',        'CDI',       'Brussels', 'Hybrid',  'LinkedIn', 'ToApply',  10, 'Perfect match skills',   0),
  ('Cloud Architect',        'Proximus',          'IT',        'CDI',       'Brussels', 'On-site', 'Other',    'Applied',   8, 'Applied 2026-03-10',     0),
  ('DevSecOps Lead',         'Médecins Sans Frontières', 'Other', 'CDD',   'Remote',   'Remote',  'Other',    'Interview', 6, 'Interview scheduled',    0),
  ('Azure Admin',            'Fake Corp SRL',     'IT',        'Freelance', 'Liège',    'Hybrid',  'Indeed',   'Rejected',  3, 'Offre suspecte',         1),
  ('Security Consultant',    'Deloitte',          'Finance',   'CDI',       'Brussels', 'Hybrid',  'LinkedIn', 'Offer',    10, 'Offer received !',       0);
