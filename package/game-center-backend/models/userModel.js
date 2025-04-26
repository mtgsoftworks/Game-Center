// models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcrypt modülünü ekliyoruz

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },
  resetAttempts: { type: Number, default: 0 }, // Deneme sayısı
  isVerified: { type: Boolean, default: false }, // Kullanıcının e-posta doğrulama durumu
  emailVerificationCode: { type: String }, // Doğrulama kodu
  emailVerificationExpires: { type: Date }, // Kodun geçerlilik süresi
  createdAt: { type: Date, default: Date.now },
});

// Şifreyi kaydetmeden önce hashleme middleware'ini kaldırın veya yoruma alın
/*
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});
*/

module.exports = mongoose.model('User', userSchema);