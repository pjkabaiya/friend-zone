function logError(scope, error) {
  const payload = {
    level: 'error',
    scope,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    timestamp: new Date().toISOString()
  };
  console.error(JSON.stringify(payload));
}

function handleServerError(res, scope, error) {
  logError(scope, error);
  return res.status(500).json({ error: 'Internal server error.' });
}

module.exports = {
  handleServerError,
  logError
};
