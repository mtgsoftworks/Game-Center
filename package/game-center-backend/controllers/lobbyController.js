// controllers/lobbyController.js
const Lobby = require('../models/lobbyModel');
const sha256 = require('js-sha256');
const crypto = require('crypto');

exports.getLobbies = async (req, res) => {
  try {
    const lobbies = await Lobby.find().populate('creator').populate('game');
    res.json(lobbies);
  } catch (error) {
    console.error('Lobileri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.createLobby = async (req, res) => {
  const { name, type, password } = req.body;

  try {
    let hashedPassword = '';
    let salt = '';

    if (password) {
      // Benzersiz bir salt oluşturun
      salt = crypto.randomBytes(16).toString('hex');

      // Şifreyi salt ile birlikte hashleyin
      hashedPassword = sha256(salt + password);
    }

    const lobby = new Lobby({
      name,
      type,
      password: hashedPassword, // Hashlenmiş şifreyi kaydedin
      salt: salt, // Salt değerini kaydedin
      creator: req.session.userId,
    });

    await lobby.save();
    res.status(201).json(lobby);
  } catch (error) {
    console.error('Lobi oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.updateLobby = async (req, res) => {
  const { id } = req.params;
  const { name, type, password } = req.body;

  try {
    const lobby = await Lobby.findById(id);
    if (!lobby) {
      return res.status(404).json({ message: 'Lobi bulunamadı.' });
    }

    // Sadece lobi sahibi güncelleyebilir
    if (lobby.creator.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Yetkisiz işlem.' });
    }

    lobby.name = name || lobby.name;
    lobby.type = type || lobby.type;

    if (password) {
      // Yeni bir salt oluşturun ve şifreyi hashleyin
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = sha256(salt + password);
      lobby.password = hashedPassword;
      lobby.salt = salt;
    }

    await lobby.save();
    res.json(lobby);
  } catch (error) {
    console.error('Lobi güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.deleteLobby = async (req, res) => {
  const { id } = req.params;

  try {
    const lobby = await Lobby.findById(id);
    if (!lobby) {
      return res.status(404).json({ message: 'Lobi bulunamadı.' });
    }

    // Sadece lobi sahibi silebilir
    if (lobby.creator.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Yetkisiz işlem.' });
    }

    await Lobby.findByIdAndDelete(id);
    res.json({ message: 'Lobi silindi.' });
  } catch (error) {
    console.error('Lobi silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.joinLobby = async (req, res) => {
  const { lobbyId, password } = req.body;

  try {
    // Loby'yi veritabanından bul
    const lobby = await Lobby.findById(lobbyId);
    if (!lobby) {
      return res.status(404).json({ message: 'Lobi bulunamadı.' });
    }

    // Şifre doğrulaması
    if (lobby.password) {
      // Kullanıcı şifre girmiş mi?
      if (!password) {
        return res.status(400).json({ message: 'Şifre gerekli.' });
      }

      // Salt değerini alın
      const salt = lobby.salt;

      // Kullanıcının girdiği şifreyi hashleyin
      const hashedPassword = sha256(salt + password);

      // Şifreleri karşılaştırın
      if (hashedPassword !== lobby.password) {
        return res.status(401).json({ message: 'Lobi şifresi yanlış.' });
      }
    }

    // Lobiye katılım işlemleri
    // Kullanıcıyı lobiye ekleyin veya gerekli işlemleri yapın

    // Örnek olarak, lobiye katılan kullanıcıları saklayalım
    // Lobi modeline 'participants' alanı eklemelisiniz

    // Eğer participants alanı yoksa ekleyelim
    if (!lobby.participants) {
      lobby.participants = [];
    }

    // Kullanıcı zaten lobiye katılmış mı?
    const alreadyJoined = lobby.participants.some(
      participantId => participantId.toString() === req.session.userId
    );
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Zaten bu lobiye katıldınız.' });
    }

    // Kullanıcıyı lobiye ekleyelim
    lobby.participants.push(req.session.userId);

    // Loby'yi kaydedelim
    await lobby.save();

    res.status(200).json({ message: 'Lobiye katıldınız.', lobby });
  } catch (error) {
    console.error('Lobiye katılma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};