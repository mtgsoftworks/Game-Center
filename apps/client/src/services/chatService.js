import { rtdb, auth } from '../firebase';
import { ref, onValue, push, onChildAdded, set, remove } from 'firebase/database';

export const createRoom = async (name) => {
  const roomsRef = ref(rtdb, 'rooms');
  const newRoomRef = push(roomsRef);
  await set(newRoomRef, {
    name,
    createdBy: auth.currentUser?.uid,
    createdAt: Date.now(),
  });
  return newRoomRef.key;
};

export const subscribeRooms = (callback) => {
  const roomsRef = ref(rtdb, 'rooms');
  return onValue(roomsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const rooms = Object.entries(data).map(([id, room]) => ({ id, ...room }));
    callback(rooms);
  });
};

export const sendMessage = async (roomId, text) => {
  const messagesRef = ref(rtdb, `messages/${roomId}`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    text,
    sender: auth.currentUser?.uid,
    timestamp: Date.now(),
  });
  return newMsgRef.key;
};

export const subscribeMessages = (roomId, callback) => {
  const messagesRef = ref(rtdb, `messages/${roomId}`);
  return onChildAdded(messagesRef, (snapshot) => {
    const msg = { id: snapshot.key, ...snapshot.val() };
    callback(msg);
  });
};

export const sendDM = async (otherUid, text) => {
  const ids = [auth.currentUser?.uid, otherUid].sort().join('_');
  const dmRef = ref(rtdb, `dms/${ids}`);
  const newMsgRef = push(dmRef);
  await set(newMsgRef, {
    text,
    sender: auth.currentUser?.uid,
    timestamp: Date.now(),
  });
  return ids;
};

export const subscribeDM = (otherUid, callback) => {
  const ids = [auth.currentUser?.uid, otherUid].sort().join('_');
  const dmRef = ref(rtdb, `dms/${ids}`);
  return onChildAdded(dmRef, (snapshot) => {
    const msg = { id: snapshot.key, ...snapshot.val() };
    callback(msg);
  });
};

export const subscribePresence = (callback) => {
  const presRef = ref(rtdb, 'presence');
  return onValue(presRef, (snapshot) => {
    const data = snapshot.val() || {};
    const users = Object.entries(data)
      .filter(([, online]) => online)
      .map(([uid]) => uid);
    callback(users);
  });
};

export const setPresence = (uid) => {
  const userRef = ref(rtdb, `presence/${uid}`);
  set(userRef, true);
  const connectedRef = ref(rtdb, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) return;
    userRef.onDisconnect().remove();
  });
};

// Typing indicator: set typing status in a DM or room
export const setTyping = (otherId, isTyping) => {
  const ids = [auth.currentUser?.uid, otherId].sort().join('_');
  const typingRef = ref(rtdb, `typing/${ids}/${auth.currentUser?.uid}`);
  if (isTyping) set(typingRef, true);
  else remove(typingRef);
};

// Subscribe to typing status for a DM or room
export const subscribeTyping = (otherId, callback) => {
  const ids = [auth.currentUser?.uid, otherId].sort().join('_');
  const typingListRef = ref(rtdb, `typing/${ids}`);
  return onValue(typingListRef, (snapshot) => {
    const data = snapshot.val() || {};
    const typers = Object.keys(data).filter(uid => uid !== auth.currentUser?.uid);
    callback(typers);
  });
};
