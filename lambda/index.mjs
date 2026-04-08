import { calculate } from '../shared/calculate.mjs';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

export const handler = async (event) => {
  if (event?.requestContext?.http?.method === 'OPTIONS' || event?.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true }),
    };
  }

  try {
    const payload =
      typeof event?.body === 'string'
        ? JSON.parse(event.body)
        : event?.body ?? event;

    const expression = payload?.expression;

    if (typeof expression !== 'string') {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ result: 'Error' }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ result: calculate(expression) }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ result: 'Error' }),
    };
  }
};
