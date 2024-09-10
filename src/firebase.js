// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBz2EzdH6_C-pp_F5Z0XcqjdHGZxEX0cNw",
  authDomain: "smart-parking-22920.firebaseapp.com",
  projectId: "smart-parking-22920",
  storageBucket: "smart-parking-22920.appspot.com",
  messagingSenderId: "411285618782",
  appId: "1:411285618782:web:7f0f49c5d41905820e34cf",
  measurementId: "G-52S6CKFK9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
