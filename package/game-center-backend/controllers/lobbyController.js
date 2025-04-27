// controllers/lobbyController.js: Lobi yönetimi işlemleri
// - getLobbies: Firestore’dan tüm lobileri ayrıntılı bilgiyle getirir
// - createLobby: Yeni lobi oluşturur, şifreleme ve creator bilgisi eklenir
// - updateLobby: Sadece lobi sahibi ad, tip ve şifre güncellemesi yapabilir
// - deleteLobby: Sadece lobi sahibi lobiyi silebilir
// - joinLobby: Şifre doğrulama ve maksimum katılımcı kısıtlaması ile lobiye katılma işlemi yapar
// - leaveLobby: Kullanıcı lobiden ayrılır

const { db, admin } = require('../utils/firebase');
const sha256 = require('js-sha256');
const crypto = require('crypto');

// Frontend URL for shareable lobby link
const frontUrl = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * getLobbies: Tüm lobileri listeler
 * @param {Object} req - Express isteği
 * @param {Object} res - Express yanıtı
 */
exports.getLobbies = async (req, res) => {
  try {
    const snapshot = await db.collection('lobbies').get();
    const now = new Date();
    const events = [];
    const normals = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate();
      if (data.type === 'normal') {
        if (now - createdAt <= 8 * 3600000) normals.push({ id: doc.id, data });
      } else if (data.type === 'event') {
        const endTime = data.endTime.toDate();
        if (now <= endTime) events.push({ id: doc.id, data });
      }
    });
    events.sort((a, b) => a.data.startTime.toDate() - b.data.startTime.toDate());
    normals.sort((a, b) => b.data.createdAt.toDate() - a.data.createdAt.toDate());
    const ordered = [...events, ...normals];
    const lobbies = await Promise.all(ordered.map(async item => {
      const d = item.data;
      const creatorSnap = await db.collection('users').doc(d.creator).get();
      const gameData = d.game ? (await db.collection('games').doc(d.game).get()).data() : null;
      return {
        id: item.id,
        name: d.name,
        type: d.type,
        startTime: d.startTime || null,
        endTime: d.endTime || null,
        creator: creatorSnap.exists ? creatorSnap.data() : null,
        game: gameData,
        participants: d.participants || [],
        createdAt: d.createdAt,
      };
    }));
    return res.json(lobbies);
  } catch (error) {
    console.error('Get lobbies error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * createLobby: Yeni lobi oluşturur
 * @param {Object} req.body - { name, type, password, startTime, endTime }
 * @param {Object} res - Express yanıtı
 */
exports.createLobby = async (req, res) => {
  const { name, type, password, startTime, endTime } = req.body;
  try {
    const uid = req.user.uid;
    const existSnap = await db.collection('lobbies').where('creator', '==', uid).get();
    if (!existSnap.empty) return res.status(400).json({ message: 'Zaten bir lobiniz var.' });
    let hashedPassword = '';
    let salt = '';
    if (password) {
      salt = crypto.randomBytes(16).toString('hex');
      hashedPassword = sha256(salt + password);
    }
    const data = { name, type, password: hashedPassword, salt, creator: uid, participants: [], createdAt: admin.firestore.FieldValue.serverTimestamp() };
    if (type === 'event') {
      if (!startTime || !endTime) return res.status(400).json({ message: 'Etkinlik için başlangıç ve bitiş zamanı gerekli.' });
      data.startTime = new Date(startTime);
      data.endTime = new Date(endTime);
    }
    const ref = await db.collection('lobbies').add(data);
    const snap = await ref.get();
    // Lobi oluşturulduktan sonra paylaşılabilir link üret
    const shareLink = `${frontUrl}/lobbies/${ref.id}`;
    res.status(201).json({ id: ref.id, ...snap.data(), shareLink });
  } catch (error) {
    console.error('Create lobby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * updateLobby: Mevcut lobiyi günceller (sahip izniyle)
 * @param {Object} req.params - { id }
 * @param {Object} req.body - { name, type, password, startTime, endTime }
 * @param {Object} res - Express yanıtı
 */
exports.updateLobby = async (req, res) => {
  const { id } = req.params;
  const { name, type, password, startTime, endTime } = req.body;
  try {
    const ref = db.collection('lobbies').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Lobby not found.' });
    const lobby = snap.data();
    if (lobby.creator !== req.user.uid) return res.status(403).json({ message: 'Unauthorized.' });
    const updates = {};
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (type === 'event') {
      if (startTime) updates.startTime = new Date(startTime);
      if (endTime) updates.endTime = new Date(endTime);
    } else {
      updates.startTime = admin.firestore.FieldValue.delete();
      updates.endTime = admin.firestore.FieldValue.delete();
    }
    if (password) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      updates.password = sha256(newSalt + password);
      updates.salt = newSalt;
    }
    await ref.update(updates);
    const updated = await ref.get();
    // Güncel lobby için paylaşılabilir link
    const shareLink = `${frontUrl}/lobbies/${id}`;
    res.json({ id: updated.id, ...updated.data(), shareLink });
  } catch (error) {
    console.error('Update lobby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * deleteLobby: Mevcut lobiyi siler (sahip izniyle)
 * @param {Object} req.params - { id }
 * @param {Object} res - Express yanıtı
 */
exports.deleteLobby = async (req, res) => {
  const { id } = req.params;
  try {
    // Doküman referansını al ve varlığını kontrol et
    const ref = db.collection('lobbies').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ message: 'Lobby not found.' });
    }
    const lobby = snap.data();
    // Sadece sahibi silebilir
    if (lobby.creator !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }
    // Firestore dokümanını sil
    await ref.delete();
    res.json({ message: 'Lobby deleted.' });
  } catch (error) {
    console.error('Delete lobby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * joinLobby: Şifre kontrolü ve maksimum katılımcı sayısı sınırıyla lobiye katılır
 * @param {Object} req.body - { lobbyId, password? }
 * @param {Object} res - Express yanıtı
 */
exports.joinLobby = async (req, res) => {
  const { lobbyId, password } = req.body;
  try {
    // Lobi dokümanını al
    const ref = db.collection('lobbies').doc(lobbyId);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ message: 'Lobby not found.' });
    }
    const data = snap.data();
    if (data.password) {
      // Şifreli lobi ise şifre kontrolü yap
      if (!password) {
        return res.status(400).json({ message: 'Password required.' });
      }
      const hash = sha256(data.salt + password);
      if (hash !== data.password) {
        return res.status(401).json({ message: 'Invalid lobby password.' });
      }
    }
    const uid = req.user.uid;
    const participants = data.participants || [];
    if (participants.includes(uid)) {
      return res.status(400).json({ message: 'Already joined.' });
    }
    if (participants.length >= 4) {
      return res.status(400).json({ message: 'Lobby is full.' });
    }
    // UID’yi katılımcılar array'ine ekle
    await ref.update({ participants: admin.firestore.FieldValue.arrayUnion(uid) });
    // Güncel lobi bilgisini al ve döndür
    const updated = await ref.get();
    res.status(200).json({ message: 'Joined lobby.', lobby: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Join lobby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * leaveLobby: Kullanıcı lobiden ayrılır
 * @param {Object} req.body - { lobbyId }
 * @param {Object} res - Express yanıtı
 */
exports.leaveLobby = async (req, res) => {
  const { lobbyId } = req.body;
  try {
    const uid = req.user.uid;
    const ref = db.collection('lobbies').doc(lobbyId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Lobby not found.' });
    const data = snap.data();
    const participants = data.participants || [];
    if (!participants.includes(uid)) return res.status(400).json({ message: 'Not in lobby.' });
    await ref.update({ participants: admin.firestore.FieldValue.arrayRemove(uid) });
    const updated = await ref.get();
    res.json({ message: 'Left lobby.', lobby: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Leave lobby error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};