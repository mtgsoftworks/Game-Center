// server.js

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

// .env dosyasından çevre değişkenlerini yükleyin
require('dotenv').config();

// Uygulama Oluşturma
const app = express();

// Güvenlik başlıkları ekle
app.use(helmet());
// Response sıkıştır
app.use(compression());
// İstek logging
app.use(morgan('combined'));
// NoSQL/SQL injection koruması
app.use(mongoSanitize());

// Veritabanı Bağlantısı
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oyunmerkezi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Veritabanına bağlandı.');
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
  });

// Orta Katmanlar
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || '4d2f5c3a7b98e6e74f56a9d48a3f7d1b2c6e3f8a9d2e4b5f6c8a9d2f3e7a6b5',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS kullanmıyorsanız false olmalıdır
      httpOnly: true,
      maxAge: 86400000, // 1 gün
    },
  })
);

// Rota Dosyaları
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const lobbyRoutes = require('./routes/lobby');

// Rota Kullanımı
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/lobbies', lobbyRoutes);

// Statik Dosyalar İçin Ayar (Üretim Ortamında)
// Eğer frontend uygulamanız build edilip public klasörüne yerleştirilmişse aşağıdaki kodu kullanabilirsiniz
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// 404 handler
const notFound = require('./middleware/notFound');
app.use(notFound);

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Hata Yakalama Orta Katmanı
app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err);
  res.status(500).json({ message: 'Sunucu Hatası.' });
});

// Sunucuyu Başlatma
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor.`);
});