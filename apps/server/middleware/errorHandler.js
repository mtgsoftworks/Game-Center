/**
 * middleware/errorHandler.js: Global hata yakalayıcı middleware'i.
 * Tüm uygulama çapındaki hataları yakalar ve uygun HTTP yanıtı döner.
 */
/**
 * @param {Error} err - Yakalanan hata nesnesi.
 * @param {Object} req - Express isteği.
 * @param {Object} res - Express yanıtı.
 * @param {function} next - Bir sonraki middleware fonksiyonu.
 */
module.exports = (err, req, res, next) => {
  console.error('Global Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Sunucu hatası.' });
};
