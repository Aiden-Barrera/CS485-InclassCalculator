import express from 'express';
import { calculate } from '../shared/calculate.mjs';

const app = express();
app.use(express.json());

export { calculate };

app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  if (typeof expression !== 'string') {
    return res.status(400).json({ result: 'Error' });
  }
  res.json({ result: calculate(expression) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
