// Data management
const GameData = {
    players: ['Ed', 'Ian', 'Zeca', 'Jorge'],
    playerColors: {
        Ed: '#2563eb',    // blue-600
        Ian: '#dc2626',   // red-600
        Zeca: '#16a34a',  // green-600
        Jorge: '#9333ea'  // purple-600
    },
    scores: JSON.parse(localStorage.getItem('scores')) || { 'Ed': 0, 'Ian': 0, 'Zeca': 0, 'Jorge': 0 },
    gameHistory: JSON.parse(localStorage.getItem('gameHistory')) || [],

    // Load data from localStorage
    init() {
        const savedScores = localStorage.getItem('scores');
        const savedHistory = localStorage.getItem('gameHistory');
        
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
        if (savedHistory) {
            this.gameHistory = JSON.parse(savedHistory);
        }

        this.updateUI();
    },

    // Save data to localStorage
    save() {
        localStorage.setItem('scores', JSON.stringify(this.scores));
        localStorage.setItem('gameHistory', JSON.stringify(this.gameHistory));
        this.updateUI();
    },

    // Update scores for 2v2 game
    update2v2Scores(winners, losers) {
        winners.forEach(player => {
            this.scores[player] += 3;
        });
        losers.forEach(player => {
            this.scores[player] = Math.max(0, this.scores[player] - 1);
        });
    },

    // Update scores for FFA game
    updateFfaScores(first, second, third) {
        this.scores[first] += 3;
        this.scores[second] += 2;
        this.scores[third] += 1;
    },

    // Update all UI elements
    updateUI() {
        this.updateCharts();
        this.updateGameHistoryList();
    },

    // Update both charts
    updateCharts() {
        // Bar Chart - Current Rankings
        const barChartOptions = {
            series: [{
                name: 'Pontos',
                data: this.players.map(player => this.scores[player])
            }],
            chart: {
                type: 'bar',
                height: 250,
                toolbar: { show: false }
            },
            colors: this.players.map(player => this.playerColors[player]),
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    columnWidth: '60%',
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: this.players,
                labels: {
                    style: { colors: '#4B5563' }
                }
            },
            yaxis: {
                title: { text: 'Pontos' },
                labels: {
                    style: { colors: '#4B5563' }
                }
            },
            grid: {
                borderColor: '#E5E7EB',
                strokeDashArray: 4
            }
        };

        // Line Chart - Points Evolution
        const lineChartData = this.players.map(player => ({
            name: player,
            data: this.getPlayerPointsHistory(player)
        }));

        const lineChartOptions = {
            series: lineChartData,
            chart: {
                type: 'line',
                height: 250,
                toolbar: { show: false }
            },
            colors: this.players.map(player => this.playerColors[player]),
            stroke: {
                width: 3,
                curve: 'smooth'
            },
            markers: {
                size: 4,
                strokeWidth: 0
            },
            xaxis: {
                type: 'numeric',
                labels: {
                    style: { colors: '#4B5563' }
                }
            },
            yaxis: {
                title: { text: 'Pontos' },
                labels: {
                    style: { colors: '#4B5563' }
                }
            },
            grid: {
                borderColor: '#E5E7EB',
                strokeDashArray: 4
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center'
            }
        };

        // Initialize or update charts
        if (!this.barChart) {
            this.barChart = new ApexCharts(document.querySelector('#bar-chart'), barChartOptions);
            this.barChart.render();
        } else {
            this.barChart.updateOptions(barChartOptions);
        }

        if (!this.lineChart) {
            this.lineChart = new ApexCharts(document.querySelector('#line-chart'), lineChartOptions);
            this.lineChart.render();
        } else {
            this.lineChart.updateOptions(lineChartOptions);
        }
    },

    // Get points history for a player
    getPlayerPointsHistory(player) {
        let points = 0;
        return this.gameHistory.map((game, index) => {
            if (game.mode === '2v2') {
                if (game.winners.includes(player)) points += 3;
                else if (game.losers.includes(player)) points = Math.max(0, points - 1);
            } else { // FFA
                if (game.first === player) points += 3;
                else if (game.second === player) points += 2;
                else if (game.third === player) points += 1;
            }
            return { x: index + 1, y: points };
        });
    },

    // Update game history list
    updateGameHistoryList() {
        const historyContainer = document.getElementById('game-history-list');
        if (!historyContainer) return;

        historyContainer.innerHTML = '';

        this.gameHistory.slice().reverse().forEach((game, index) => {
            const realIndex = this.gameHistory.length - 1 - index;
            const card = document.createElement('div');
            card.className = 'bg-gray-50 rounded-lg p-4 game-card';

            if (game.mode === '2v2') {
                card.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">2v2</span>
                        <div class="flex gap-2">
                            <button onclick="GameData.editGame(${realIndex})" class="text-blue-600 hover:text-blue-700">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button onclick="GameData.deleteGame(${realIndex})" class="text-red-600 hover:text-red-700">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-green-600 material-symbols-outlined">emoji_events</span>
                            <span>${game.winners.join(' + ')}</span>
                        </div>
                        <span class="text-green-600 font-medium">+3</span>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-2">
                            <span class="text-red-600 material-symbols-outlined">close</span>
                            <span>${game.losers.join(' + ')}</span>
                        </div>
                        <span class="text-red-600 font-medium">-1</span>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-500">FFA</span>
                        <div class="flex gap-2">
                            <button onclick="GameData.editGame(${realIndex})" class="text-blue-600 hover:text-blue-700">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button onclick="GameData.deleteGame(${realIndex})" class="text-red-600 hover:text-red-700">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-yellow-500 material-symbols-outlined">looks_one</span>
                                <span>${game.first}</span>
                            </div>
                            <span class="text-green-600 font-medium">+3</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 material-symbols-outlined">looks_two</span>
                                <span>${game.second}</span>
                            </div>
                            <span class="text-green-600 font-medium">+2</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-amber-800 material-symbols-outlined">looks_3</span>
                                <span>${game.third}</span>
                            </div>
                            <span class="text-green-600 font-medium">+1</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-purple-600 material-symbols-outlined">looks_4</span>
                                <span>${game.fourth}</span>
                            </div>
                            <span class="text-gray-400 font-medium">0</span>
                        </div>
                    </div>
                `;
            }
            historyContainer.appendChild(card);
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameData.init();

    // Game mode selection
    const btn2v2 = document.getElementById('btn2v2');
    const btnFFA = document.getElementById('btnFFA');
    const form2v2 = document.getElementById('form2v2');
    const formFFA = document.getElementById('formFFA');

    btn2v2.addEventListener('click', () => {
        btn2v2.classList.add('border-blue-500', 'text-blue-600');
        btnFFA.classList.remove('border-blue-500', 'text-blue-600');
        form2v2.classList.remove('hidden');
        formFFA.classList.add('hidden');
    });

    btnFFA.addEventListener('click', () => {
        btnFFA.classList.add('border-blue-500', 'text-blue-600');
        btn2v2.classList.remove('border-blue-500', 'text-blue-600');
        formFFA.classList.remove('hidden');
        form2v2.classList.add('hidden');
    });

    // Form submission
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!form2v2.classList.contains('hidden')) {
            // 2v2 mode
            const winner1 = form.querySelector('[name="winner1"]').value;
            const winner2 = form.querySelector('[name="winner2"]').value;
            const loser1 = form.querySelector('[name="loser1"]').value;
            const loser2 = form.querySelector('[name="loser2"]').value;

            if (!winner1 || !winner2 || !loser1 || !loser2) {
                alert('Por favor, selecione todos os jogadores');
                return;
            }

            const winners = [winner1, winner2];
            const losers = [loser1, loser2];

            // Check for duplicates
            const allPlayers = [...winners, ...losers];
            if (new Set(allPlayers).size !== allPlayers.length) {
                alert('Um jogador não pode estar em ambos os times');
                return;
            }

            GameData.update2v2Scores(winners, losers);
            GameData.gameHistory.push({
                mode: '2v2',
                winners,
                losers,
                timestamp: new Date().toISOString()
            });
        } else {
            // FFA mode
            const first = form.querySelector('[name="first"]').value;
            const second = form.querySelector('[name="second"]').value;
            const third = form.querySelector('[name="third"]').value;
            const fourth = form.querySelector('[name="fourth"]').value;

            if (!first || !second || !third || !fourth) {
                alert('Por favor, selecione todos os jogadores');
                return;
            }

            // Check for duplicates
            const allPlayers = [first, second, third, fourth];
            if (new Set(allPlayers).size !== allPlayers.length) {
                alert('Cada posição deve ter um jogador diferente');
                return;
            }

            GameData.updateFfaScores(first, second, third);
            GameData.gameHistory.push({
                mode: 'ffa',
                first,
                second,
                third,
                fourth,
                timestamp: new Date().toISOString()
            });
        }

        GameData.save();
        form.reset();
    });
});

// Game editing functions
GameData.editGame = function(index) {
    const game = this.gameHistory[index];
    // TODO: Implement edit functionality
    console.log('Editing game:', game);
};

GameData.deleteGame = function(index) {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
        this.gameHistory.splice(index, 1);
        this.recalculateScores();
        this.save();
    }
};

GameData.recalculateScores = function() {
    // Reset all scores
    this.players.forEach(player => {
        this.scores[player] = 0;
    });

    // Recalculate based on history
    this.gameHistory.forEach(game => {
        if (game.mode === '2v2') {
            this.update2v2Scores(game.winners, game.losers);
        } else {
            this.updateFfaScores(game.first, game.second, game.third);
        }
    });
};
