import { useState } from 'react';
import './App.css';

const BUTTONS = [
  ['Clear', 'Backspace', '%', '÷'],
  ['7', '8', '9', 'x'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['+/-', '0', '.', '='],
];
const CALCULATE_URL = import.meta.env.VITE_CALCULATE_URL || '/api/calculate';
console.log('CALCULATE_URL:', CALCULATE_URL);

export default function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [isCalculating, setIsCalculating] = useState(false);

  async function calculate(expression) {
    try {
      const response = await fetch(CALCULATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression }),
      });

      if (!response.ok) return 'Error';

      const data = await response.json();
      return typeof data.result === 'string' ? data.result : 'Error';
    } catch {
      return 'Error';
    }
  }

  async function handleButton(label) {
    if (label === 'Clear') {
      setExpression('');
      setDisplay('0');
      return;
    }

    if (label === 'Backspace') {
      const next = expression.slice(0, -1);
      setExpression(next);
      setDisplay(next || '0');
      return;
    }

    if (label === '+/-') {
      const toggled = expression.replace(/([\d.]+)$/, (match) =>
        String(-parseFloat(match))
      );
      setExpression(toggled);
      setDisplay(toggled || '0');
      return;
    }

    if (label === '=') {
      if (!expression || isCalculating) return;
      setIsCalculating(true);
      const result = await calculate(expression);
      setDisplay(result);
      setExpression(result === 'Error' ? '' : result);
      setIsCalculating(false);
      return;
    }

    const next = expression + label;
    setExpression(next);
    setDisplay(next);
  }

  function buttonClass(label) {
    if (label === '=') return 'btn btn-equals';
    if (label === 'Clear') return 'btn btn-clear';
    if (['÷', 'x', '-', '+', '%', 'Backspace'].includes(label))
      return 'btn btn-operator';
    return 'btn';
  }

  return (
    <div className="calculator">
      <div className="expression-display">{expression || '\u00a0'}</div>
      <div className="main-display">{display}</div>
      <div className="buttons">
        {BUTTONS.map((row, r) =>
          row.map((label) => (
            <button
              key={`${r}-${label}`}
              className={buttonClass(label)}
              disabled={isCalculating && label === '='}
              onClick={() => handleButton(label)}
            >
              {label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
