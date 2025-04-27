// server.js: Oyun Merkezi backend uygulamasının ana dosyası.
// - Express ile HTTP sunucusu oluşturulur.
// - Global middleware ve route yapılandırmaları burada tanımlanır.
// - API route'ları eklenir ve global hata işleme yapılandırılır.
// - Çalışan sunucu belirtilen portta dinlemeye alınır.

// Express çerçevesini import ederek uygulama oluşturulacak
const express = require('express');

// Gönderilen JSON ve URL-encoded request gövdelerini parse etmek için body-parser
const bodyParser = require('body-parser');

// Farklı origin’lerden gelen istekleri kontrol etmek için CORS ayarları
const cors = require('cors');

// Dosya ve dizin yolları işlemleri için path modülü
const path = require('path');

// Güvenlik başlıkları eklemek için Helmet middleware
const helmet = require('helmet');

// HTTP yanıtlarını sıkıştırarak performans iyileştirmesi sağlayan compression
const compression = require('compression');

// Gelen isteklerin loglanması için Morgan kullanılıyor
const morgan = require('morgan');

// Firebase Admin SDK üzerinden Firestore (db) ve Auth (auth) modüllerini import ediyoruz
const { db, auth, admin } = require('./utils/firebase');

// .env dosyasından çevre değişkenlerini yükleyin
require('dotenv').config();

// Uygulama Oluşturma
const app = express();

// Güvenlik başlıkları ekle
// Helmet ile uygulamaya güvenlik başlıkları ekleniyor (XSS, HSTS vb.)
app.use(helmet());

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
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Çerezlerin ve header’ların gönderilmesine izin ver
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
// parse cookies for session token
app.use(cookieParser());

// Session Store
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

app.use(session({
  cookie: { maxAge: 86400000 }, // 24 saat
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
const lobbyRoutes = require('./routes/lobby');

// Rota Kullanımı
app.use('/api/auth', authRoutes);   // Kimlik doğrulama API route'ları
app.use('/api/games', gameRoutes);  // Oyun listeleme API route'ları
app.use('/api/lobbies', lobbyRoutes);// Lobi yönetimi API route'ları

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
app.use(notFound);    // Tanımsız route'lar için 404 handler'ı

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler); // Global hata yakalama middleware'i

// Hata Yakalama Orta Katmanı
app.use((err, req, res, next) => {
  console.error('Sunucu Hatası:', err);
  res.status(500).json({ message: 'Sunucu Hatası.' });
});

// Zamanlanmış görevler için cron
const cron = require('node-cron');

// Sunucuyu Başlatma
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { // Sunucuyu belirtilen PORT'ta başlatır
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor.`);
});

// Cron job: Normal lobileri 8 saat sonra otomatik sil
cron.schedule('0 * * * *', async () => {
  try {
    const cutoff = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 8 * 3600000));
    const snapshot = await db.collection('lobbies')
      .where('type', '==', 'normal')
      .where('createdAt', '<=', cutoff)
      .get();
    snapshot.forEach(doc => doc.ref.delete());
    console.log(`Cron: Silinen ${snapshot.size} eski normal lobiler.`);
  } catch (err) {
    console.error('Cron cleanup error:', err);
  }
});

// Testler için app export
module.exports = app;