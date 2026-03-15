const UI = {

  renderTable(jobs) {
    const tbody = document.getElementById('jobs-body');
    tbody.innerHTML = '';
    if (!jobs.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-secondary)">Aucune candidature trouvée</td></tr>';
      return;
    }
    jobs.forEach(job => {
      const tr = document.createElement('tr');
        if (job.fake_flag) tr.classList.add('row-fake');
      tr.innerHTML = `
        <td><strong>${job.job_title}</strong>${job.fake_flag ? ' <span class="badge badge-fake">⚠️</span>' : ''}</td>
        <td>${job.company}</td>
        <td>${job.sector || '—'}</td>
        <td><span class="badge badge-${job.status}">${job.status}</span></td>
        <td>${job.remote || '—'}</td>
        <td title="${job.fit_score || 0}/10">${Utils.fitStars(job.fit_score)}</td>
        <td>${Utils.formatDate(job.date_added)}</td>
        <td>
          <button class="btn-edit" data-id="${job.id}" data-action="edit">✏️</button>
          <button class="btn-delete" data-id="${job.id}" data-action="delete">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderStats(stats) {
    const d = stats.data;
    document.getElementById('stats-section').innerHTML = `
      <div class="stat-card">
        <span class="stat-value">${d.total_applications}</span>
        <span class="stat-label">Candidatures</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${d.by_status?.Applied || 0}</span>
        <span class="stat-label">Envoyées</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${d.by_status?.Interview || 0}</span>
        <span class="stat-label">Entretiens</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${d.average_fit_score ?? '—'}</span>
        <span class="stat-label">Fit moyen</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${d.fake_applications}</span>
        <span class="stat-label">Suspectes</span>
      </div>
    `;
  },

  showModal(job = null) {
    const modal   = document.getElementById('modal');
    const form    = document.getElementById('modal-form');
    const title   = document.getElementById('modal-title');
    form.reset();
    if (job) {
      title.textContent = 'Modifier la candidature';
      modal.dataset.jobId = job.id;
      Object.entries(job).forEach(([key, val]) => {
        const el = form.elements[key];
        if (!el || val === null || val === undefined) return;
        if (el.type === 'checkbox') el.checked = Boolean(val);
        else el.value = val;
      });
    } else {
      title.textContent = 'Ajouter une candidature';
      modal.dataset.jobId = '';
    }
    document.getElementById('modal-overlay').classList.remove('hidden');
    form.elements['job_title']?.focus();
  },

  hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-form').reset();
  },

  getFormData() {
    const form = document.getElementById('modal-form');
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (!el.name) return;
      if (el.type === 'checkbox') data[el.name] = el.checked ? 1 : 0;
      else if (el.value !== '') data[el.name] = el.value;
    });
    return data;
  }

};
