// utils/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../tombola-game-1bcea-firebase-adminsdk-fbsvc-2c13c86fe7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
