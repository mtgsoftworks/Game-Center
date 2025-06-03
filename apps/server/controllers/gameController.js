/**
 * controllers/gameController.js: Oyun yönetimi işlemlerini içerir.
 * Bu controller, oyun listesini almayı ve yeni oyun eklemeyi sağlar.
 *
 * Fonksiyonlar:
 *  - getGames(req, res): Firestore'dan oyun listesini çeker ve JSON olarak döner.
 *  - createGame(req, res): Yeni oyun oluşturma işlemi (şablon).
 */

// Oyun yönetimi işlevlerini barındıran denetleyici dosyası
// - getGames: Firestore'dan oyun listesini alır ve JSON olarak döner
// - createGame: Yeni oyun ekleme şablonu (yetki kontrolü eklenebilir)

const { db } = require('../utils/firebase');

/**
 * getGames: Mevcut tüm oyunları listeler
 * @param {Object} req - Express isteği
 * @param {Object} res - Express yanıtı
 */
exports.getGames = async (req, res) => {
  try {
    // 'games' koleksiyonundan tüm dökümanları çek
    const snapshot = await db.collection('games').get();
    // Her dokümanı id ve veri objesi olarak dönüştür
    const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // İstemciye JSON formatında oyun listesini gönder
    res.json(games);
  } catch (error) {
    // Hata durumunda konsola detaylı bilgi yazdır ve 500 yanıtı gönder
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// GET /:id - Belirli bir oyunun detaylarını döner
exports.getGameById = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('games').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Oyun bulunamadı.' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get game by ID error:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

/**
 * createGame: Yeni oyun oluşturma işlemi (şablon)
 * Bu bölüm, yetki kontrolü ve veri validasyonu eklenerek genişletilebilir
 */
// exports.createGame = async (req, res) => {
//   try {
//     // TODO: 'games' koleksiyonuna yeni oyun ekle
//   } catch (error) {
//     console.error('Create game error:', error);
//     res.status(500).json({ message: 'Sunucu hatası.' });
//   }
// };