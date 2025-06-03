/**
 * middleware/validate.js: Express-validator sonuçlarını kontrol eden middleware.
 * Girilen isteklerdeki validasyon hatalarını yakalar ve JSON formatında döner.
 */
const { validationResult } = require('express-validator');

/**
 * İstek body validasyon hatalarını kontrol eder
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
