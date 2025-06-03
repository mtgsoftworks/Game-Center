// server.js: Oyun Merkezi backend uygulamasının ana dosyası.
// - Express ile HTTP sunucusu oluşturulur.
// - Global middleware ve route yapılandırmaları burada tanımlanır.
// - API route'ları eklenir ve global hata işleme yapılandırılır.
// - Çalışan sunucu belirtilen portta dinlemeye alınır.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Express çerçevesini import ederek uygulama oluşturulacak
const express = require('express');

// Gönderilen JSON ve URL-encoded request gövdelerini parse etmek için body-parser
const bodyParser = require('body-parser');

// Farklı origin'lerden gelen istekleri kontrol etmek için CORS ayarları
const cors = require('cors');

// Güvenlik başlıkları eklemek için Helmet middleware
const helmet = require('helmet');

// HTTP yanıtlarını sıkıştırarak performans iyileştirmesi sağlayan compression
const compression = require('compression');

// Gelen isteklerin loglanması için Morgan kullanılıyor
const morgan = require('morgan');

// Firebase Admin SDK üzerinden Firestore (db) ve Auth (auth) modüllerini import ediyoruz
const { db, auth, admin } = require('./utils/firebase');

// Uygulama Oluşturma
const app = express();

// Güvenlik başlıkları ekle
// Helmet ile uygulamaya güvenlik başlıkları ekleniyor (XSS, HSTS vb.)
app.use(helmet());

// Cross-Origin-Opener-Policy pop-ups için izin ver
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin-allow-popups' }));

// Response sıkıştır
// Yanıt boyutunu küçültmek için gzip sıkıştırması uygulanıyor
app.use(compression());

// İstek logging
// Tüm HTTP istekleri konsola ve dosyalara loglanıyor
app.use(morgan('combined'));

// Orta Katmanlar
// Cross-Origin Resource Sharing (CORS) yapılandırması
app.use(
  cors({
    origin: true,
    credentials: true, // Çerezlerin ve header'ların gönderilmesine izin ver
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// İsteklerdeki çerezleri ayrıştırmak için cookie-parser modülü
const cookieParser = require('cookie-parser');
// Oturum belirteci için çerezleri ayrıştırmak
app.use(cookieParser());

// Oturum Depolama
// Oturum yönetimi için express-session modülü
const session = require('express-session');
// Oturum verilerini bellek tabanlı saklama için memorystore modülü
const MemoryStore = require('memorystore')(session);

app.use(session({
  cookie: {
    maxAge: 86400000,       // 24 saat
    sameSite: 'none',       // cross-site cookie gönderimine izin ver
    secure: false,          // geliştirme ortamında HTTPS gerekmeden
  },
  store: new MemoryStore({
    checkPeriod: 86400000 // 24 saat
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'secret'
}));

// Rota Dosyaları
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

// Rota Kullanımı
app.use('/api/auth', authRoutes);   // Kimlik doğrulama API route'ları
app.use('/api/games', gameRoutes);  // Oyun listeleme API route'ları

// Statik Dosyalar İçin Ayar (Üretim Ortamında)
// Eğer frontend uygulamanız build edilip public klasörüne yerleştirilmişse aşağıdaki kodu kullanabilirsiniz
if (process.env.NODE_ENV === 'production') {
  const STATIC_DIR = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(STATIC_DIR));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
  });
}

// 404 işleyici
const notFound = require('./middleware/notFound');
app.use(notFound);    // Tanımsız route'lar için 404 handler'ı

// Global Hata İşleyici
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler); // Global hata yakalama middleware'i

// Hata Yakalama Orta Katmanı
app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err);
  res.status(500).json({ message: 'Sunucu Hatası.' });
});

// Sunucuyu Başlatma
// SERVER_PORT environment variable kullan, yoksa PORT, yoksa 8081 default
const PORT = process.env.SERVER_PORT || process.env.PORT || 8081;
app.listen(PORT, () => { // Sunucuyu belirtilen PORT'ta başlatır
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor.`);
});

// Testler için app export
module.exports = app;