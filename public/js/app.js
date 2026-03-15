// ── Filtres ──────────────────────────────────────────────
const getFilters = () => Utils.buildParams({
  search:    document.getElementById('search-input').value.trim(),
  status:    document.getElementById('filter-status').value,
  sector:    document.getElementById('filter-sector').value,
  remote:    document.getElementById('filter-remote').value,
  fake_flag: document.getElementById('filter-fake').value,
});

// ── Chargement données ────────────────────────────────────
const loadData = async () => {
  try {
    const [jobs, stats] = await Promise.all([
      Api.getAll(getFilters()),
      Api.getStats()
    ]);
    UI.renderTable(jobs.data);
    UI.renderStats(stats);
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
};

// ── Thème ─────────────────────────────────────────────────
const applyTheme = (theme) => {
  document.body.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent =
    theme === 'dark' ? '☀️ Light' : '🌙 Dark';
};

// ── Init ──────────────────────────────────────────────────
const init = () => {
  // Thème persisté
  applyTheme(localStorage.getItem('theme') || 'light');

  // Chargement initial
  loadData();

  // Filtres
  const debouncedLoad = Utils.debounce(loadData, 300);
  document.getElementById('search-input').addEventListener('input', debouncedLoad);
  document.getElementById('filter-status').addEventListener('change', loadData);
  document.getElementById('filter-sector').addEventListener('change', loadData);
  document.getElementById('filter-remote').addEventListener('change', loadData);
  document.getElementById('filter-fake').addEventListener('change', loadData);

  // Reset filtres
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-sector').value = '';
    document.getElementById('filter-remote').value = '';
    document.getElementById('filter-fake').value = '';
    loadData();
  });

  // Export CSV
  document.getElementById('btn-export').addEventListener('click', () => {
  Api.exportCsv();
  Utils.showToast('Export CSV lancé ✓', 'success');
});

  // Import CSV
document.getElementById('btn-import').addEventListener('click', () => {
  document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const csvContent = evt.target.result;
    const btn = document.getElementById('btn-import');
    btn.disabled = true;
    btn.textContent = 'Import...';
    try {
      const res = await Api.importCsv(csvContent);
      const { inserted, warnings, errors } = res.data;

      // Toast résumé
      const hasIssues = warnings.length > 0 || errors.length > 0;
      const msg = `${inserted} insérées${warnings.length ? `, ${warnings.length} doublons` : ''}${errors.length ? `, ${errors.length} erreurs` : ''}`;
      Utils.showToast(msg, errors.length > 0 ? 'error' : warnings.length > 0 ? 'info' : 'success');

      // Télécharger le log si problèmes
      if (hasIssues) {
        const logLines = [
          `=== Import CSV — ${new Date().toLocaleString('fr-BE')} ===`,
          `Insérées : ${inserted}`,
          `Doublons (importés avec warning) : ${warnings.length}`,
          `Erreurs (non importées) : ${errors.length}`,
          '',
        ];
        if (warnings.length) {
          logLines.push('--- WARNINGS (doublons) ---');
          warnings.forEach(w => logLines.push(w));
          logLines.push('');
        }
        if (errors.length) {
          logLines.push('--- ERREURS (lignes ignorées) ---');
          errors.forEach(e => logLines.push(e));
        }

        const blob = new Blob([logLines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `import_log_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }

      await loadData();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '⬆️ Import CSV';
      e.target.value = ''; // reset pour pouvoir réimporter le même fichier
    }
  };
  reader.readAsText(file, 'UTF-8');
});



  // Dark mode
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // Ouvrir modal (ajout)
  document.getElementById('btn-add-job').addEventListener('click', () => UI.showModal(null));

  // Fermer modal
  document.getElementById('modal-cancel').addEventListener('click', UI.hideModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) UI.hideModal();
  });

  // Délégation events table (Edit / Delete)
  document.getElementById('jobs-body').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { id, action } = btn.dataset;

    if (action === 'edit') {
      try {
        const job = await Api.getOne(id);
        UI.showModal(job.data);
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    }

    if (action === 'delete') {
      if (!window.confirm('Supprimer cette candidature ?')) return;
      try {
        await Api.remove(id);
        await loadData();
        Utils.showToast('Candidature supprimée', 'success');
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    }
  });

  // Submit modal (Create / Update)
  document.getElementById('modal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const jobId  = document.getElementById('modal').dataset.jobId;
  const data   = UI.getFormData();
  const btn    = document.getElementById('modal-submit');
  const label  = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Enregistrement...';
  try {
    if (jobId) {
      await Api.update(jobId, data);
      Utils.showToast('Candidature mise à jour ✓', 'success');
    // ✅ APRÈS
    } else {
      const result = await Api.create(data);
      Utils.showToast('Candidature ajoutée ✓', 'success');
      // Déclencher l'analyse IA si activée (async, non bloquant)
      const aiEnabled = localStorage.getItem('aiEnabled') === 'true';
      if (aiEnabled && result && result.data && result.data.id) {
        analyzeJobAsync(result.data.id);
      }
    }
    UI.hideModal();
    await loadData();

  } catch (err) {
    Utils.showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

};
const analyzeJobAsync = async (jobId) => {
  try {
    Utils.showToast('🤖 Analyse IA en cours...', 'info');
    const scoreResult = await Api.analyzeJob(jobId);
const fakeResult = await Api.detectFake(jobId);

    ('scoreResult complet:', JSON.stringify(scoreResult));  // 👈 debug
    ('fakeResult complet:', JSON.stringify(fakeResult));    // 👈 debug

    // Bloc score
    if (scoreResult.success && scoreResult.data.score) {
      const currentJob = await Api.getOne(jobId);
      ('currentJob reçu:', JSON.stringify(currentJob));     // 👈 debug

      const existingNote = currentJob?.data?.notes?.trim() ?? '';
      const aiNote = `🤖 [${new Date().toLocaleDateString('fr-BE')}] Score IA : ${scoreResult.data.score}/10 — ${scoreResult.data.reasoning}`;
      const updatedNote = existingNote ? `${existingNote}\n\n${aiNote}` : aiNote;

      ('updatedNote à sauver:', updatedNote);               // 👈 debug

      await Api.update(jobId, { fit_score: scoreResult.data.score, notes: updatedNote });
      Utils.showToast(`🤖 Score IA : ${scoreResult.data.score}/10`, 'info');
    }

    // Bloc fake
    if (fakeResult.success && fakeResult.data.isFake && fakeResult.data.confidence >= 0.7) {
      const reasons = fakeResult.data.reasons.join(', ');
      await Api.update(jobId, { fake_flag: 1 });
      Utils.showToast(`🚩 Offre suspecte détectée : ${reasons}`, 'error');
    }

    await loadData();

  } catch (error) {
    console.error('analyzeJobAsync error:', error); // 👈 debug
    Utils.showToast('ℹ️ IA indisponible', 'info');
  }
};




document.addEventListener('DOMContentLoaded', init);
