const sendErrorResponse = (res, statusCode, message, err, extra = {}) => {
  if (err) {
    console.error(`[${statusCode}] ${message}`, err.stack || err);
  }

  const body = { error: message, ...extra };

  if (process.env.NODE_ENV === "development" && err?.message) {
    body.details = err.message;
  }

  return res.status(statusCode).json(body);
};

module.exports = { sendErrorResponse };
