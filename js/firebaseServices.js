// firebaseServices.js
import { database } from './firebaseConfig';

import { ref, set, push, onValue, update } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js';
// Add new game to game history
export const addGameToHistory = async (gameData) => {
  try {
    const gameHistoryRef = ref(database, 'gameHistory');
    await push(gameHistoryRef, gameData);
    
    // Update player scores based on game result
    await updatePlayerScores(gameData);
  } catch (error) {
    console.error("Error adding game to history:", error);
  }
};

// Update player scores based on game result
export const updatePlayerScores = async (gameData) => {
  const scoresRef = ref(database, 'scores');
  
  if (gameData.mode === '2v2') {
    gameData.winners.forEach(player => {
      updatePlayerScore(player, 3);
    });
    
    gameData.losers.forEach(player => {
      updatePlayerScore(player, -1);
    });
  } else if (gameData.mode === 'ffa') {
    updatePlayerScore(gameData.first, 3);
    updatePlayerScore(gameData.second, 2);
    updatePlayerScore(gameData.third, 1);
  }
};

// Helper function to update individual player score
const updatePlayerScore = async (player, points) => {
  const playerScoreRef = ref(database, `scores/${player}`);
  
  onValue(playerScoreRef, (snapshot) => {
    const currentScore = snapshot.val() || 0;
    const newScore = currentScore + points;
    
    set(playerScoreRef, newScore);
  }, { onlyOnce: true });
};

// Fetch current rankings
export const fetchRankings = (callback) => {
  const scoresRef = ref(database, 'scores');
  
  onValue(scoresRef, (snapshot) => {
    const scores = snapshot.val();
    const rankings = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([player, score]) => ({ player, score }));
    
    callback(rankings);
  });
};

// Fetch game history
export const fetchGameHistory = (callback) => {
  const gameHistoryRef = ref(database, 'gameHistory');
  
  onValue(gameHistoryRef, (snapshot) => {
    const games = snapshot.val();
    const gamesList = games ? Object.values(games) : [];
    
    callback(gamesList);
  });
};

// Initialize database with initial data if not exists
export const initializeDatabase = async () => {
  const initialData = {
    players: ["Ed", "Ian", "Zeca", "Jorge"],
    scores: {
      "Ed": 0,
      "Ian": 0,
      "Jorge": 0,
      "Zeca": 0
    },
    playerColors: {
      "Ed": "#2563eb",
      "Ian": "#dc2626",
      "Jorge": "#9333ea",
      "Zeca": "#16a34a"
    },
    gameHistory: [],
    metadata: {
      lastUpdated: new Date().toLocaleDateString('pt-BR'),
      version: "1.0.0"
    }
  };

  const rootRef = ref(database);
  
  try {
    await set(rootRef, initialData);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

