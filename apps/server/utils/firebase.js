/**
 * utils/firebase.js: Firebase Admin SDK yapılandırma modülü.
 * Bu modül, Firebase Admin SDK'yı başlatır ve Firestore ile Auth modüllerini dışa aktarır.
 *
 * Dışa Aktarılanlar:
 *  - admin: Firebase Admin SDK instance'ı.
 *  - db: Firestore veritabanı instance'ı.
 *  - auth: Kimlik doğrulama (Auth) instance'ı.
 */
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
// Determine service account JSON path: local file
// Use local service account JSON directly
const keyPath = path.join(__dirname, 'testing-app-42cde-firebase-adminsdk-fbsvc-4f0afd7489.json');
const serviceAccount = require(keyPath);

// Expose the service account JSON path for google-gax (Firestore gRPC)
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
