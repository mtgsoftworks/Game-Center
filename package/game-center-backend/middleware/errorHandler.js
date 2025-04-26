// Global Error Handler Middleware
module.exports = (err, req, res, next) => {
  console.error('Global Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Sunucu hatası.' });
};
