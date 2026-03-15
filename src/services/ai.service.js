require('dotenv').config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const AI_TIMEOUT = parseInt(process.env.AI_TIMEOUT || '60000', 10);

const callOllama = async (prompt, model, systemPrompt = '') => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        format: 'json',
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Ollama timeout (60s)');
    }
    throw error;
  }
};

const parseJSON = (text, fallbackRegex = null) => {
  try {
    return JSON.parse(text);
  } catch {
    if (fallbackRegex) {
      const match = text.match(fallbackRegex);
      if (match) return match;
    }
    throw new Error('JSON parsing failed');
  }
};

const analyzeFitScore = async (jobData, model) => {
  const prompt = `Analyse cette offre d'emploi et attribue un fit score de 1 à 10.
Réponds UNIQUEMENT avec ce JSON : {"score": <entier 1-10>, "reasoning": "<explication courte>"}

- Titre: ${jobData.job_title}
- Entreprise: ${jobData.company}
- Secteur: ${jobData.sector || 'Non spécifié'}
- Remote: ${jobData.remote || 'Non spécifié'}
- Notes: ${jobData.notes || 'Aucune'}`;

  const response = await callOllama(prompt, model);
  const parsed = parseJSON(response, /"score"\s*:\s*(\d+)/i);

  return {
    score: parsed.score || parseInt(parsed[1], 10) || null,
    reasoning: parsed.reasoning || 'Analyse IA',
  };
};

const detectFake = async (jobData, model) => {
  const prompt = `Analyse cette offre d'emploi et détermine si elle est potentiellement frauduleuse.
Réponds UNIQUEMENT avec ce JSON : {"isFake": true|false, "confidence": <0-1>, "reasons": ["raison1", "raison2"]}

Indicateurs de fraude : grammaire douteuse, salaire irréaliste, absence de détails, urgence excessive.

- Titre: ${jobData.job_title}
- Entreprise: ${jobData.company}
- Salaire: ${jobData.salary_range || 'Non spécifié'}
- Notes: ${jobData.notes || 'Aucune'}`;

  const response = await callOllama(prompt, model);
  const parsed = parseJSON(response);

  return {
    isFake: parsed.isFake || false,
    confidence: parsed.confidence || 0,
    reasons: parsed.reasons || [],
  };
};

const getAvailableModels = async () => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Ollama non disponible');
    }

    const data = await response.json();
    return data.models.map(m => m.name);
  } catch (error) {
    throw new Error(`Ollama inaccessible : ${error.message}`);
  }
};

module.exports = {
  analyzeFitScore,
  detectFake,
  getAvailableModels,
};
