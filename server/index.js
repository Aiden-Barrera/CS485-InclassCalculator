const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * calculate(expression) - evaluates a calculator expression string.
 * Replaces display symbols (x, ÷, %) with JS equivalents and uses
 * the Function constructor to safely evaluate the arithmetic.
 * @param {string} expression
 * @returns {string} result or "Error"
 */
function calculate(expression) {
  try {
    // Replace display operators with JS operators
    let expr = expression
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100');

    // Validate: only allow digits, operators, parens, dots, spaces
    if (!/^[\d\s\+\-\*\/\.\(\)]+$/.test(expr)) {
      return 'Error';
    }

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + expr + ')')();

    if (!isFinite(result)) return 'Error';

    // Return integer if whole, otherwise up to 10 decimal places (trimmed)
    return Number.isInteger(result)
      ? String(result)
      : parseFloat(result.toFixed(10)).toString();
  } catch {
    return 'Error';
  }
}

app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  if (typeof expression !== 'string') {
    return res.status(400).json({ error: 'expression must be a string' });
  }
  res.json({ result: calculate(expression) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
