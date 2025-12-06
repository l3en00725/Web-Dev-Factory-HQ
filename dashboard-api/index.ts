// dashboard-api/index.ts
import express from 'express';
import cors from 'cors';
import { registerSite } from './routes/sites/register.js';
import { getStatus } from './routes/status.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/sites/register', registerSite);
app.get('/api/status', getStatus);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Dashboard API listening at http://localhost:${port}`);
});

