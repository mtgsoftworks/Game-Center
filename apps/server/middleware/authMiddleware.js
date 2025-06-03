/**
 * middleware/authMiddleware.js: Kimlik doğrulama kontrolü middleware'i.
 * Gelen isteklerdeki Bearer token veya çerezdeki token'ı doğrular.
 * Başarılıysa req.user'a çözülmüş kullanıcı bilgisini atar.
 */
/**
 * @param {Object} req - Express isteği nesnesi.
 * @param {Object} res - Express yanıt nesnesi.
 * @param {function} next - Sonraki middleware fonksiyonu.
 */
const { auth } = require('../utils/firebase');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  let idToken;

  if (header && header.startsWith('Bearer ')) {
    idToken = header.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    idToken = req.cookies.token;
  } else {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Unauthorized.' });
  }
};