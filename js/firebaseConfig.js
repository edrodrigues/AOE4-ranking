// firebaseConfig.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyDMJqwIoIor_-SFFQwgawrfxsAszxyOIYU",
  authDomain: "aoe4-tracker.firebaseapp.com",
  databaseURL: "https://aoe4-tracker-default-rtdb.firebaseio.com",
  projectId: "aoe4-tracker",
  storageBucket: "aoe4-tracker.firebasestorage.app",
  messagingSenderId: "9353989374",
  appId: "1:9353989374:web:eca8228ce528323301e9af",
  measurementId: "G-5S7XCY3VCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };