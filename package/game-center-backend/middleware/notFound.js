// 404 Not Found Middleware
module.exports = (req, res, next) => {
  res.status(404).json({ message: 'Kaynak bulunamadı.' });
};
