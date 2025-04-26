// controllers/authController.js

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const rateLimit = require('express-rate-limit');

// Rate Limiter Ayarları
const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika içinde
  max: 5, // En fazla 5 istek
  message:
    'Çok fazla şifre sıfırlama girişiminde bulundunuz, lütfen daha sonra tekrar deneyin.',
});

const sendResetCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika içinde
  max: 3, // En fazla 3 istek
  message:
    'Çok fazla doğrulama kodu talep ettiniz, lütfen daha sonra tekrar deneyin.',
});

// Kayıt Olma Fonksiyonu
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    console.log('Kayıt isteği alındı:', email);

    // Kullanıcı zaten var mı kontrol edin
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Kullanıcı zaten mevcut:', email);
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor.' });
    }

    // Şifreyi hashleyin
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluşturun (henüz aktif değil)
    const user = new User({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
    });

    // 6 haneli doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 saat geçerli

    await user.save();

    // Doğrulama kodunu e-posta ile gönderin
    const message = `
      Kayıt işleminizi tamamlamak için aşağıdaki doğrulama kodunu kullanın:
      \n\n Doğrulama Kodunuz: ${verificationCode}
      \n\n Bu kod 24 saat boyunca geçerlidir.
      \n\n Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'E-posta Doğrulama Kodu',
        message,
      });
    } catch (emailError) {
      console.error('E-posta gönderme hatası:', emailError);
      return res.status(500).json({ message: 'E-posta gönderilemedi.' });
    }

    console.log('Doğrulama kodu e-posta ile gönderildi:', email);

    res.status(200).json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({
      email,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi geçmiş doğrulama kodu.' });
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      message: 'E-posta doğrulama başarılı. Kayıt tamamlandı.',
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Giriş Yapma Fonksiyonu
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Giriş isteği alındı:', email);

    // Kullanıcıyı bulun
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }

    if (!user.isVerified) {
      console.log('Kullanıcının e-posta doğrulanmamış:', email);
      return res.status(400).json({ message: 'E-posta adresiniz doğrulanmamış. Lütfen doğrulayın.' });
    }

    // Şifreleri karşılaştırın
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Şifre yanlış:', email);
      return res.status(400).json({ message: 'Geçersiz email veya şifre.' });
    }

    // Oturum aç
    req.session.userId = user._id;

    console.log('Giriş başarılı:', email);

    res.status(200).json({
      message: 'Giriş başarılı.',
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Kullanıcı Bilgisi Alma Fonksiyonu
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      console.log('Kullanıcı bulunamadı:', req.session.userId);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgisi alınamadı:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Doğrulama Kodu Gönderme Fonksiyonu
exports.sendResetCode = [
  sendResetCodeLimiter,
  async (req, res) => {
    console.log('Doğrulama kodu gönderme isteği alındı:', req.body.email);

    // Validasyon hatalarını kontrol edin
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validasyon hatası:', errors.array());
      return res
        .status(400)
        .json({ message: 'Geçersiz giriş.', errors: errors.array() });
    }

    const { email, token } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        // Kullanıcı yoksa, yine de genel bir mesaj döndürün
        console.log('Kullanıcı bulunamadı:', email);
        return res
          .status(200)
          .json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });
      }

      // reCAPTCHA doğrulaması
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      console.log('reCAPTCHA doğrulaması başlıyor.');

      // reCAPTCHA API'sine istek gönder
      const captchaVerification = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: secretKey,
            response: token,
          },
        }
      );

      console.log('reCAPTCHA doğrulama yanıtı:', captchaVerification.data);

      const { success, 'error-codes': errorCodes } = captchaVerification.data;

      if (!success) {
        console.log('reCAPTCHA doğrulaması başarısız:', errorCodes);
        return res.status(400).json({ message: 'CAPTCHA doğrulaması başarısız.' });
      }

      console.log('reCAPTCHA doğrulaması başarılı.');

      // 6 haneli doğrulama kodu oluştur
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetCode = resetCode;
      user.resetCodeExpires = Date.now() + 2 * 60 * 1000; // 2 dakika geçerli
      user.resetAttempts = 0; // Şifre sıfırlama deneme sayısını sıfırla

      await user.save();

      const message = `
        Şifre sıfırlama talebinde bulundunuz.
        Doğrulama Kodunuz: ${resetCode}
        Kodunuz 2 dakika boyunca geçerlidir ve en fazla 3 kez deneyebilirsiniz.
        Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Şifre Sıfırlama Doğrulama Kodu',
          message,
        });
      } catch (emailError) {
        console.error('Reset kodu e-posta gönderme hatası:', emailError);
        return res.status(500).json({ message: 'Doğrulama kodu gönderilemedi.' });
      }

      console.log('Doğrulama kodu e-posta ile gönderildi:', email);

      // İşlemler başarılıysa yanıtı gönderin
      return res
        .status(200)
        .json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });
    } catch (error) {
      console.error('Doğrulama kodu gönderilirken hata:', error);
      // Hata durumunda uygun bir yanıt gönderin
      return res.status(500).json({ message: 'İşlem sırasında bir hata oluştu.' });
    }
  },
];

// Şifre Sıfırlama Fonksiyonu
exports.resetPassword = [
  resetPasswordLimiter,
  async (req, res) => {
    console.log('Şifre sıfırlama isteği alındı:', req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validasyon hatası:', errors.array());
      return res
        .status(400)
        .json({ message: 'Geçersiz giriş.', errors: errors.array() });
    }

    const { email, resetCode, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      console.log('Şifreler eşleşmiyor:', email);
      return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        console.log('Kullanıcı bulunamadı:', email);
        return res.status(400).json({ message: 'Geçersiz veya süresi geçmiş doğrulama kodu.' });
      }

      // Deneme sayısını kontrol et
      if (user.resetAttempts >= 3) {
        console.log('Deneme sayısı aşıldı:', email);
        return res.status(429).json({
          message:
            'Çok fazla yanlış deneme yaptınız. Lütfen yeni bir doğrulama kodu talep edin.',
        });
      }

      // Kodun geçerlilik süresini kontrol et
      if (!user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
        console.log('Doğrulama kodunun süresi doldu:', email);
        return res.status(400).json({
          message: 'Doğrulama kodunun süresi dolmuştur. Lütfen yeni bir kod talep edin.',
        });
      }

      // Doğrulama kodunu kontrol et
      if (user.resetCode !== resetCode) {
        user.resetAttempts = (user.resetAttempts || 0) + 1; // Deneme sayısını artır
        await user.save();
        console.log(
          `Geçersiz doğrulama kodu. Kalan deneme hakkı: ${
            3 - user.resetAttempts
          } | Kullanıcı: ${email}`
        );
        return res.status(400).json({
          message: `Geçersiz doğrulama kodu. ${
            3 - user.resetAttempts
          } deneme hakkınız kaldı.`,
        });
      }

      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.resetAttempts = undefined;

      await user.save();

      console.log('Şifre başarıyla sıfırlandı:', email);

      res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı.' });
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      res.status(500).json({ message: 'İşlem sırasında bir hata oluştu.' });
    }
  },
];