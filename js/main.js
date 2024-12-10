// main.js
import { 
    addGameToHistory, 
    fetchRankings, 
    fetchGameHistory, 
    initializeDatabase 
} from './firebaseServices.js';
  
  // DOM Elements
  const currentRankingsEl = document.getElementById('current-rankings');
  const gameHistoryEl = document.getElementById('game-history');
  const form2v2 = document.getElementById('form2v2');
  const formFFA = document.getElementById('formFFA');
  
  // Initialize Firebase Database
  initializeDatabase();
  
  // Render Rankings
  function renderRankings(rankings) {
    currentRankingsEl.innerHTML = rankings.map((rank, index) => `
      <div class="flex justify-between items-center bg-gray-100 p-3 rounded">
        <span class="font-medium">${rank.player}</span>
        <span class="font-bold">${rank.score} pts</span>
      </div>
    `).join('');
  }
  
  // Render Game History
  function renderGameHistory(games) {
    gameHistoryEl.innerHTML = games.map(game => {
      if (game.mode === '2v2') {
        return `
          <div class="bg-gray-100 p-4 rounded">
            <div class="font-medium">${game.date} - 2v2</div>
            <div class="text-green-600">Winners: ${game.winners.join(', ')}</div>
            <div class="text-red-600">Losers: ${game.losers.join(', ')}</div>
          </div>
        `;
      } else {
        return `
          <div class="bg-gray-100 p-4 rounded">
            <div class="font-medium">${game.date} - FFA</div>
            <div>1st: ${game.first}</div>
            <div>2nd: ${game.second}</div>
            <div>3rd: ${game.third}</div>
            <div>4th: ${game.fourth}</div>
          </div>
        `;
      }
    }).join('');
  }
  
  // Fetch and Display Rankings and Game History
  fetchRankings(renderRankings);
  fetchGameHistory(renderGameHistory);
  
  // Add Game Handlers
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const gameMode = document.querySelector('input[name="game-mode"]:checked').value;
    const gameDate = document.getElementById('game-date').value;
    
    let gameData;
    
    if (gameMode === '2v2') {
      const winnerPlayers = Array.from(document.querySelectorAll('input[name="winner-players"]:checked'))
        .map(el => el.value);
      const loserPlayers = Array.from(document.querySelectorAll('input[name="loser-players"]:checked'))
        .map(el => el.value);
      
      gameData = {
        date: gameDate,
        mode: '2v2',
        winners: winnerPlayers,
        losers: loserPlayers
      };
    } else {
      gameData = {
        date: gameDate,
        mode: 'ffa',
        first: document.getElementById('first-place').value,
        second: document.getElementById('second-place').value,
        third: document.getElementById('third-place').value,
        fourth: document.getElementById('fourth-place').value
      };
    }
    
    addGameToHistory(gameData);
  });
  
  // Additional initialization and event listeners can be added here