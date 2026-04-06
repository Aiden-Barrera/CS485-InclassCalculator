import { useState } from 'react';
import './App.css';

const BUTTONS = [
  ['Clear', 'Backspace', '%', '÷'],
  ['7', '8', '9', 'x'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['+/-', '0', '.', '='],
];

export default function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');

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
      if (!expression) return;
      try {
        const res = await fetch('http://localhost:3001/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression }),
        });
        const data = await res.json();
        setDisplay(data.result);
        setExpression(data.result === 'Error' ? '' : data.result);
      } catch {
        setDisplay('Error');
        setExpression('');
      }
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
