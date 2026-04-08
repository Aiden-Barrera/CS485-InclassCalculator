export function calculate(expression) {
  try {
    const expr = expression
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100');

    if (!/^[\d\s+\-*/.()\n]+$/.test(expr)) return 'Error';

    const result = Function('"use strict"; return (' + expr + ')')();

    if (!isFinite(result)) return 'Error';

    return Number.isInteger(result)
      ? String(result)
      : parseFloat(result.toFixed(10)).toString();
  } catch {
    return 'Error';
  }
}
