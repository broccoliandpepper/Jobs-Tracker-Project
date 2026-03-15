// ── Webhook n8n ───────────────────────────────────────────
const initWebhookToggle = () => {
  const webhookToggle = document.getElementById('webhook-toggle');
  const modeSelect = document.getElementById('n8n-mode-select');
  const customIpInput = document.getElementById('n8n-custom-ip');
  const copyUrlBtn = document.getElementById('copy-webhook-url-btn');
  const testWebhookBtn = document.getElementById('test-webhook-btn');

  const webhookEnabled = localStorage.getItem('webhookEnabled') === 'true';
  const n8nMode = localStorage.getItem('n8nMode') || 'local';

  if (webhookToggle) {
    webhookToggle.checked = webhookEnabled;
    updateWebhookToggleUI(webhookEnabled);
  }
  if (modeSelect) {
    modeSelect.value = n8nMode;
    updateWebhookURL();
  }

  if (webhookToggle) {
    webhookToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      localStorage.setItem('webhookEnabled', enabled);
      updateWebhookToggleUI(enabled);
      updateWebhookURL();
    });
  }
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      localStorage.setItem('n8nMode', mode);
      updateWebhookURL();
      toggleCustomIpInput(mode);
    });
  }
  if (customIpInput) {
    customIpInput.addEventListener('input', updateWebhookURL);
  }
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener('click', () => {
      const url = document.getElementById('webhook-url-display').textContent;
      navigator.clipboard.writeText(url).then(() => {
        Utils.showToast('📋 URL copiée', 'success');
      });
    });
  }
  if (testWebhookBtn) {
    testWebhookBtn.addEventListener('click', testWebhookConnection);
  }

  toggleCustomIpInput(n8nMode);
};

const updateWebhookToggleUI = (enabled) => {
  const statusLabel = document.getElementById('webhook-status-label');
  const modeSelect = document.getElementById('n8n-mode-select');
  const urlBox = document.getElementById('webhook-url-box');
  const testWebhookBtn = document.getElementById('test-webhook-btn');

  if (statusLabel) {
    statusLabel.textContent = enabled ? '✓ Actif' : 'Inactif';
    statusLabel.className = enabled ? 'status-active' : 'status-inactive';
  }
  if (modeSelect) modeSelect.disabled = !enabled;
  if (urlBox) urlBox.style.display = enabled ? 'block' : 'none';
  if (testWebhookBtn) testWebhookBtn.style.display = enabled ? 'inline-block' : 'none';
};

const updateWebhookURL = () => {
  const webhookUrlDisplay = document.getElementById('webhook-url-display');
  const contextNote = document.getElementById('webhook-context-note');
  if (!webhookUrlDisplay) return;

  const mode = localStorage.getItem('n8nMode') || 'local';
  const port = '3333';
  const customIp = document.getElementById('n8n-custom-ip')?.value || '';

  let url = '';
  let note = '';

  switch (mode) {
    case 'docker-mac':
      url = `http://host.docker.internal:${port}/api/jobs/webhook`;
      note = '🐳 Requiert Docker Desktop 18.03+ ou flag --add-host host.docker.internal:host-gateway';
      break;
    case 'docker-linux':
      url = `http://172.17.0.1:${port}/api/jobs/webhook`;
      note = '🐳 Adresse gateway bridge Docker par défaut — vérifier avec docker network inspect bridge si échec';
      break;
    case 'docker-custom':
      url = customIp ? `http://${customIp}:${port}/api/jobs/webhook` : "Indiquez l'IP custom ci-dessus";
      note = "🐳 Indiquez l'IP du réseau Docker custom ou de l'hôte accessible depuis le conteneur n8n";
      break;
    default:
      url = `http://localhost:${port}/api/jobs/webhook`;
      note = '💻 n8n et JobTracker sur la même machine';
  }

  webhookUrlDisplay.textContent = url;
  if (contextNote) contextNote.textContent = note;
};

const toggleCustomIpInput = (mode) => {
  const customIpContainer = document.getElementById('n8n-custom-ip-container');
  if (customIpContainer) {
    customIpContainer.style.display = mode === 'docker-custom' ? 'block' : 'none';
  }
};

const testWebhookConnection = async () => {
  const resultBadge = document.getElementById('webhook-test-result');
  try {
    const response = await fetch('/api/webhook/ping');
    const result = await response.json();

    if (result.status === 'ok') {
      const lastCall = result.lastCall ? new Date(result.lastCall) : null;
      const hoursSinceLastCall = lastCall ? (new Date() - lastCall) / (1000 * 60 * 60) : null;

      if (!lastCall) {
        resultBadge.textContent = '🟠 Actif mais aucun appel reçu';
        resultBadge.className = 'badge badge-warning';
      } else if (hoursSinceLastCall < 24) {
        resultBadge.textContent = '🟢 Webhook actif et joignable';
        resultBadge.className = 'badge badge-success';
      } else {
        resultBadge.textContent = '🟠 Aucun appel depuis 24h';
        resultBadge.className = 'badge badge-warning';
      }
    } else {
      resultBadge.textContent = '🔴 Webhook désactivé';
      resultBadge.className = 'badge badge-error';
    }
  } catch (error) {
    resultBadge.textContent = '🔴 Erreur de connexion';
    resultBadge.className = 'badge badge-error';
  }
};

// ── Ai functions ───────────────────────────────────────────

const initAIToggle = () => {
  const aiToggle = document.getElementById('ai-toggle');
  const modelSelect = document.getElementById('ai-model-select');
  const refreshModelsBtn = document.getElementById('refresh-models-btn');


  const aiEnabled = localStorage.getItem('aiEnabled') === 'true';
  if (aiToggle) {
    aiToggle.checked = aiEnabled;
    updateAIToggleUI(aiEnabled);
  }

  loadAvailableModels();

  if (aiToggle) {
    aiToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      localStorage.setItem('aiEnabled', enabled);
      updateAIToggleUI(enabled);
    });
  }

  if (modelSelect) {
    const savedModel = localStorage.getItem('aiModel') || 'llama3';
    modelSelect.value = savedModel;
    modelSelect.addEventListener('change', (e) => {
      localStorage.setItem('aiModel', e.target.value);
    });
  }

  if (refreshModelsBtn) {
    refreshModelsBtn.addEventListener('click', loadAvailableModels);
  }
};

const updateAIToggleUI = (enabled) => {
  const statusLabel = document.getElementById('ai-status-label');
  const modelSelect = document.getElementById('ai-model-select');

  if (statusLabel) {
    statusLabel.textContent = enabled ? '✓ Actif' : 'Inactif';
    statusLabel.className = enabled ? 'status-active' : 'status-inactive';
  }

  if (modelSelect) {
    modelSelect.disabled = !enabled;
  }
};

const loadAvailableModels = async () => {
  const modelSelect = document.getElementById('ai-model-select');
  if (!modelSelect) return;

  try {
    const response = await fetch('/api/ollama/models');
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      modelSelect.innerHTML = '';
      result.data.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });

      const savedModel = localStorage.getItem('aiModel');
      if (savedModel && result.data.includes(savedModel)) {
        modelSelect.value = savedModel;
      } else {
        modelSelect.value = result.data[0];
        localStorage.setItem('aiModel', result.data[0]);
      }

      const aiEnabled = localStorage.getItem('aiEnabled') === 'true';
      modelSelect.disabled = !aiEnabled;
    } else {
      modelSelect.innerHTML = '<option>Ollama non disponible</option>';
      modelSelect.disabled = true;
    }
  } catch (error) {
    modelSelect.innerHTML = '<option>Ollama non disponible</option>';
    modelSelect.disabled = true;
  }
};


const initBackupUI = () => {
  const backupBtn = document.getElementById('backup-btn');
  const lastBackupLabel = document.getElementById('last-backup-label');

  updateLastBackupDisplay();

  if (backupBtn) {
    backupBtn.addEventListener('click', async () => {
      try {
        backupBtn.disabled = true;
        backupBtn.textContent = 'Sauvegarde...';

        const response = await fetch('/api/backup');
        const result = await response.json();

        if (result.success) {
          localStorage.setItem('lastBackupTimestamp', new Date().toISOString());
          Utils.showToast(`✅ Backup créé : ${result.data.filename}`, 'success');
          updateLastBackupDisplay();
        } else {
          Utils.showToast(`❌ Erreur : ${result.error}`, 'error');
        }
      } catch (error) {
        Utils.showToast(`❌ Erreur réseau : ${error.message}`, 'error');
      } finally {
        backupBtn.disabled = false;
        backupBtn.textContent = '💾 Backup DB';
      }
    });
  }
};

const updateLastBackupDisplay = () => {
  const lastBackupLabel = document.getElementById('last-backup-label');
  if (!lastBackupLabel) return;

  const lastBackup = localStorage.getItem('lastBackupTimestamp');

  if (!lastBackup) {
    lastBackupLabel.textContent = 'Aucun backup récent';
    lastBackupLabel.className = 'backup-status backup-none';
    return;
  }

  const backupDate = new Date(lastBackup);
  const now = new Date();
  const daysSince = Math.floor((now - backupDate) / (1000 * 60 * 60 * 24));

  const formattedDate = backupDate.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  lastBackupLabel.textContent = `Dernier backup : ${formattedDate}`;

  if (daysSince < 7) {
    lastBackupLabel.className = 'backup-status backup-recent';
  } else if (daysSince < 30) {
    lastBackupLabel.className = 'backup-status backup-warning';
  } else {
    lastBackupLabel.className = 'backup-status backup-old';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initWebhookToggle();
    initAIToggle();
    initBackupUI();
  });
} else {
  initWebhookToggle();
  initAIToggle();
  initBackupUI();
}

