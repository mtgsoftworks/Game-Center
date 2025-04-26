import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { app } from '../services/firebase';

// Config is now mostly for providers and maybe specific Database instance if needed

// No need to redefine firebaseConfig here, it's in services/firebase.ts

// Get the already initialized app instance
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); // REMOVED - Initialization is done in services

// Export Auth instance from the main app
export const auth = getAuth(app);

// Export providers (can stay here or move to services)
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Export Realtime Database instance (if used alongside Firestore)
export const database = getDatabase(app);