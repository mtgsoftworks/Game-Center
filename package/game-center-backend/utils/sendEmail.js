// utils/sendEmail.js

require('dotenv').config();

const { MailtrapClient } = require('mailtrap');

// Mailtrap client yapılandırma
const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

/**
 * sendEmail fonksiyonu
 * - Mailtrap API kullanarak e-posta gönderir.
 * @param {object} options - { email, subject, message }
 * @returns {Promise<object>} Mailtrap API yanıtı
 */
const sendEmail = async (options) => {
  // Gönderici bilgilerini .env'den al
  const sender = {
    email: process.env.MAILTRAP_SENDER_EMAIL,
    name: process.env.MAILTRAP_SENDER_NAME,
  };
  const recipients = [{ email: options.email }];

  try {
    // Mailtrap üzerinden e-posta gönderimi
    const response = await client.send({
      from: sender,
      to: recipients,
      subject: options.subject,
      text: options.message,
    });
    return response;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw new Error('E-posta gönderilemedi');
  }
};

module.exports = sendEmail;