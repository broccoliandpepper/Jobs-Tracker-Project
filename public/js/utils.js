const Utils = {

  formatDate: (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-BE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  },

  fitStars: (score) => {
    const n = Math.min(Math.max(parseInt(score) || 0, 0), 10);
    const filled = Math.round(n / 2);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  },

  debounce: (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  buildParams: (obj) => {
    const clean = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) clean[k] = v;
    });
    return clean;
  },

  showToast: (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
      }, 15000);
  },

  formatErrorMessage: (error) => {
    const msg = error.message || '';
    if (msg.includes('Ollama') || msg.includes('11434') || msg.includes('ECONNREFUSED')) {
      return '⚠️ Ollama indisponible — vérifiez que le service est démarré (ollama serve)';
    }
    if (msg.includes('Webhook disabled')) {
      return '⚠️ Webhook désactivé — activez le toggle "n8n Webhook" dans les paramètres';
    }
    if (msg.includes('Unauthorized')) {
      return '🔒 Token webhook invalide — vérifiez WEBHOOK_SECRET dans .env';
    }
    if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
      return '🌐 Erreur réseau — vérifiez que le serveur est démarré (npm start)';
    }
    return `❌ Erreur : ${msg}`;
  }

};

