import express from 'express';

const app = express();
app.use(express.json());

// The one public function the assignment requires
export function calculate(expression) {
  try {
    const expr = expression
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100');

    if (!/^[\d\s+\-*/.()\n]+$/.test(expr)) return 'Error';

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + expr + ')')();

    if (!isFinite(result)) return 'Error';

    return Number.isInteger(result)
      ? String(result)
      : parseFloat(result.toFixed(10)).toString();
  } catch {
    return 'Error';
  }
}

app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  if (typeof expression !== 'string') {
    return res.status(400).json({ result: 'Error' });
  }
  res.json({ result: calculate(expression) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
