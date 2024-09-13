// backend/routes/firebase.js
require('dotenv').config();  // Load environment variables from .env file

const admin = require('firebase-admin');

// Construct serviceAccount object from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optionally, you can add other configurations here if needed
});

const db = admin.firestore();

module.exports = { db };
