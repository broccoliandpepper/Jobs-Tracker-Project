const BASE_URL = '/api/jobs';

const _fetch = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
  } catch (e) {
    throw new Error('Serveur inaccessible. Vérifiez que npm start est actif.');
  }

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 404) throw new Error('Candidature introuvable (supprimée ?)');
    if (res.status === 500) throw new Error('Erreur serveur interne. Consultez les logs.');
    throw new Error(data.error || 'Erreur API');
  }

  return data;
};

const Api = {
  getAll:      (params = {}) => _fetch('?' + new URLSearchParams(params)),
  getOne:      (id) => _fetch('/' + id),
  create:      (data) => _fetch('', { method: 'POST', body: JSON.stringify(data) }),
  update:      (id, data) => _fetch('/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  remove:      (id) => _fetch('/' + id, { method: 'DELETE' }),
  getStats:    () => _fetch('/stats'),
  exportCsv:   () => { window.open('/api/jobs/export'); },
  importCsv:   (csvContent) => _fetch('/import', { method: 'POST', body: JSON.stringify({ csvContent }) }),

  // Sprint 2 Phase 2 - IA Ollama
  analyzeJob:      (jobId) => fetch(`/api/jobs/${jobId}/analyze`, { method: 'POST' }).then(r => r.json()),
  detectFake:      (jobId) => fetch(`/api/jobs/${jobId}/detect-fake`, { method: 'POST' }).then(r => r.json()),
  getOllamaModels: () => fetch('/api/ollama/models').then(r => r.json()),
};
