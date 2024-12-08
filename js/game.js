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
        this.updateCurrentRankings();
        this.updatePlayerPoints();
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
        const historyContainer = document.getElementById('game-history');
        if (!historyContainer) return;

        historyContainer.innerHTML = '';
        this.gameHistory.forEach((game, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
            
            let gameDetails = '';
            if (game.mode === '2v2') {
                gameDetails = `
                    <div class="flex-grow">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">${game.date || 'Data não informada'}</span>
                        </div>
                        <p class="text-gray-600">
                            <span class="font-medium text-green-600">${game.winners.join(' + ')}</span>
                            venceram
                            <span class="font-medium text-red-600">${game.losers.join(' + ')}</span>
                        </p>
                    </div>
                `;
            } else {
                gameDetails = `
                    <div class="flex-grow">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">${game.date || 'Data não informada'}</span>
                        </div>
                        <p class="text-gray-600">
                            <span class="font-medium text-yellow-600">1º</span> ${game.first} •
                            <span class="font-medium text-gray-600">2º</span> ${game.second} •
                            <span class="font-medium text-amber-600">3º</span> ${game.third} •
                            <span class="font-medium text-red-600">4º</span> ${game.fourth}
                        </p>
                    </div>
                `;
            }

            historyItem.innerHTML = `
                ${gameDetails}
                <div class="flex items-center gap-2">
                    <button onclick="GameData.editGame(${index})" class="p-2 text-gray-500 hover:text-blue-500">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onclick="GameData.deleteGame(${index})" class="p-2 text-gray-500 hover:text-red-500">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            `;

            historyContainer.appendChild(historyItem);
        });
    },

    // Update current rankings with player cards
    updateCurrentRankings() {
        const rankingsContainer = document.getElementById('current-rankings');
        if (!rankingsContainer) return;

        // Sort players by score
        const sortedPlayers = this.players.slice().sort((a, b) => this.scores[b] - this.scores[a]);
        
        // Clear current rankings
        rankingsContainer.innerHTML = '';

        // Create player cards
        sortedPlayers.forEach((player, index) => {
            const card = document.createElement('div');
            
            // Define color classes based on player
            const colorClasses = {
                Ed: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700 text-blue-600',
                Ian: 'from-red-50 to-red-100 border-red-200 text-red-700 text-red-600',
                Zeca: 'from-green-50 to-green-100 border-green-200 text-green-700 text-green-600',
                Jorge: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700 text-purple-600'
            };

            const colors = colorClasses[player];
            const [bgFrom, bgTo, border, nameColor, pointsColor] = colors.split(' ');

            // Get medal based on position
            let medal = '';
            if (index === 0 && this.scores[player] > 0) {
                medal = '<span class="material-symbols-outlined text-3xl text-yellow-500">military_tech</span>';
            } else if (index === 1 && this.scores[player] > 0) {
                medal = '<span class="material-symbols-outlined text-3xl text-gray-400">military_tech</span>';
            } else if (index === 2 && this.scores[player] > 0) {
                medal = '<span class="material-symbols-outlined text-3xl text-amber-700">military_tech</span>';
            } else {
                medal = '<div class="w-8"></div>';
            }

            // Create HTML for the card
            card.innerHTML = `
                <div class="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r ${colors} border ${border}">
                    ${medal}
                    <div class="flex-grow">
                        <h3 class="text-lg font-semibold ${nameColor}">${player}</h3>
                        <p class="${pointsColor}">${this.scores[player]} pontos</p>
                    </div>
                </div>
            `;

            rankingsContainer.appendChild(card);
        });
    },

    // Update individual player point displays
    updatePlayerPoints() {
        this.players.forEach(player => {
            const pointsElement = document.getElementById(`${player.toLowerCase()}-points`);
            if (pointsElement) {
                pointsElement.textContent = `${this.scores[player]} pontos`;
            }
        });
    },

    // Add new game
    addGame(mode, data) {
        // Get the date input
        const dateInput = document.getElementById('gameDate');
        const date = dateInput ? dateInput.value : '';

        // Validate date format (DD/MM/YY)
        if (date && !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/.test(date)) {
            alert('Por favor, insira a data no formato DD/MM/YY');
            return;
        }

        const game = { mode, date, ...data };
        
        if (mode === '2v2') {
            const { team1, team2 } = data;
            game.winners = team1;
            game.losers = team2;
            this.update2v2Scores(team1, team2);
        } else {
            const { first, second, third, fourth } = data;
            game.first = first;
            game.second = second;
            game.third = third;
            game.fourth = fourth;
            this.updateFfaScores(first, second, third);
        }

        this.gameHistory.unshift(game); // Add new game at the beginning
        this.save();
    },

    // Clear form after adding game
    clearForm() {
        const form = document.querySelector('form');
        if (form) {
            form.reset();
            document.getElementById('gameDate').value = '';
            document.getElementById('form2v2').classList.add('hidden');
            document.getElementById('formFFA').classList.add('hidden');
        }
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

            GameData.addGame('2v2', { team1: winners, team2: losers });
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

            GameData.addGame('ffa', { first, second, third, fourth });
        }

        GameData.clearForm();
    });
});

// Game editing functions
GameData.editGame = function(index) {
    const game = this.gameHistory[index];
    if (!game) return;

    // Reset form
    this.clearForm();

    // Set date
    const dateInput = document.getElementById('gameDate');
    if (dateInput) {
        dateInput.value = game.date || '';
    }

    // Set game mode and show corresponding form
    const mode = game.mode.toLowerCase();
    if (mode === '2v2') {
        document.getElementById('form2v2').classList.remove('hidden');
        document.getElementById('formFFA').classList.add('hidden');
        
        // Set winners
        document.querySelector('[name="winner1"]').value = game.winners[0] || '';
        document.querySelector('[name="winner2"]').value = game.winners[1] || '';
        
        // Set losers
        document.querySelector('[name="loser1"]').value = game.losers[0] || '';
        document.querySelector('[name="loser2"]').value = game.losers[1] || '';

        // Update button styles
        document.getElementById('btn2v2').classList.add('border-blue-500', 'bg-blue-50');
        document.getElementById('btnFFA').classList.remove('border-blue-500', 'bg-blue-50');
    } else {
        document.getElementById('formFFA').classList.remove('hidden');
        document.getElementById('form2v2').classList.add('hidden');
        
        // Set positions
        document.querySelector('[name="first"]').value = game.first || '';
        document.querySelector('[name="second"]').value = game.second || '';
        document.querySelector('[name="third"]').value = game.third || '';
        document.querySelector('[name="fourth"]').value = game.fourth || '';

        // Update button styles
        document.getElementById('btnFFA').classList.add('border-blue-500', 'bg-blue-50');
        document.getElementById('btn2v2').classList.remove('border-blue-500', 'bg-blue-50');
    }

    // Remove the old game
    this.gameHistory.splice(index, 1);
    
    // Recalculate scores
    this.recalculateScores();
    this.save();

    // Scroll to form
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
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
