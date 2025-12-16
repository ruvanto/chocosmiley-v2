
import 'server-only';
import admin from 'firebase-admin';

// Ensure the private key is decoded correctly
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error: any) {
    // Log a more helpful error message
    console.error('Firebase Admin Initialization Error:', error.message);
    // You might want to throw the error or handle it differently depending on your app's needs
    // For now, we'll log it to avoid crashing the server on startup if keys are missing.
  }
}

// Check if the app was initialized before exporting services
const app = admin.apps.length ? admin.app() : null;

export const adminMessaging = app ? app.messaging() : null;
export const adminFirestore = app ? app.firestore() : null;
