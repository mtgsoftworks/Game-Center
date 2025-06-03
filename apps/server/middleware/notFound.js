/**
 * middleware/notFound.js: Geçersiz route çağrılarında 404 Not Found middleware'i.
 * Tanımlanmamış endpoint'lere JSON formatında 'Kaynak bulunamadı.' mesajı döner.
 */
// 404 Not Found Middleware
module.exports = (req, res, next) => {
  res.status(404).json({ message: 'Kaynak bulunamadı.' });
};
