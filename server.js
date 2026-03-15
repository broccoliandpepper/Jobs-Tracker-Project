require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // ← nouveau

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', require('./src/routes/index'));
app.use('/api/backup', require('./src/routes/backup.routes'));
app.use('/api/ollama', require('./src/routes/ollama.routes')); // NOUVEAU
app.use('/api/webhook', require('./src/routes/webhook.routes')); // NOUVEAU


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
