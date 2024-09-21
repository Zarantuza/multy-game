import { Player } from './player.js';

export class Game {
    constructor() {
        this.board = [];
        this.solution = [];
        this.players = new Map();
        this.localPlayer = null;
        this.network = null;
        this.selectedCell = { row: 0, col: 0 };
        this.cellColors = Array(9).fill().map(() => Array(9).fill(null));
        this.chronometerInterval = null;
        this.startTime = null;
    }

    setNetwork(network) {
        this.network = network;
    }

    init() {
        this.generateSudoku();
        this.renderBoard();
        this.addEventListeners();
        this.addLocalPlayer();
        this.updatePlayersDisplay();
        this.startChronometer();
        this.addInfoIcon();
    }

    generateSudoku() {
        this.solution = this.generateSolution();
        this.board = this.solution.map(row => [...row]);
        this.removeNumbers();
    }

    generateSolution() {
        let grid = Array(9).fill().map(() => Array(9).fill(0));
        this.fillCell(grid, 0, 0);
        return grid;
    }
    
    fillCell(grid, row, col) {
        if (col === 9) {
            col = 0;
            row++;
            if (row === 9) return true;
        }
    
        if (grid[row][col] !== 0) return this.fillCell(grid, row, col + 1);
    
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
        for (let num of numbers) {
            if (this.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.fillCell(grid, row, col + 1)) return true;
                grid[row][col] = 0;
            }
        }
    
        return false;
    }
    
    isValid(grid, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num || grid[x][col] === num) return false;
        }
    
        let boxRow = Math.floor(row / 3) * 3;
        let boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
    
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    removeNumbers() {
        const difficulty = 40;  // Number of cells to remove
        for (let i = 0; i < difficulty; i++) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            while (this.board[row][col] === 0) {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 9);
            }
            this.board[row][col] = 0;
        }
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (this.board[i][j] !== 0) {
                    cell.textContent = this.board[i][j];
                    if (this.cellColors[i][j]) {
                        cell.style.color = this.cellColors[i][j];
                    } else {
                        cell.classList.add('fixed');
                    }
                }
                gameBoard.appendChild(cell);
            }
        }
        this.updateSelectedCell();
    }

    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('gameBoard').addEventListener('click', this.handleCellClick.bind(this));
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        switch (key) {
            case 'arrowup':
            case 'z':
            case 'w':
                this.moveSelection(0, -1);
                break;
            case 'arrowdown':
            case 's':
                this.moveSelection(0, 1);
                break;
            case 'arrowleft':
            case 'q':
            case 'a':
                this.moveSelection(-1, 0);
                break;
            case 'arrowright':
            case 'd':
                this.moveSelection(1, 0);
                break;
            case 'enter':
                this.submitNumber();
                break;
            case 'backspace':
            case 'delete':
                this.clearNumber();
                break;
            default:
                if (key >= '1' && key <= '9') {
                    this.setNumber(parseInt(key));
                }
        }
    }

    handleCellClick(event) {
        const cell = event.target.closest('.cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.selectedCell = { row, col };
            this.updateSelectedCell();
        }
    }

    moveSelection(dx, dy) {
        const newRow = Math.max(0, Math.min(8, this.selectedCell.row + dy));
        const newCol = Math.max(0, Math.min(8, this.selectedCell.col + dx));
        this.selectedCell = { row: newRow, col: newCol };
        this.updateSelectedCell();
        this.network.broadcastPosition(this.selectedCell);
    }

    updateSelectedCell() {
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));
        const selectedElement = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }

    setNumber(num) {
        const cell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        if (cell && !cell.classList.contains('fixed')) {
            cell.textContent = num;
            cell.classList.add('user-input');
        }
    }

    clearNumber() {
        const cell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        if (cell && !cell.classList.contains('fixed')) {
            cell.textContent = '';
            cell.classList.remove('user-input');
        }
    }

    submitNumber() {
        const cell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        if (cell && !cell.classList.contains('fixed') && cell.classList.contains('user-input')) {
            const value = parseInt(cell.textContent);
            if (value) {
                this.makeMove(this.selectedCell.row, this.selectedCell.col, value);
            }
        }
    }

    makeMove(row, col, value) {
        if (!this.localPlayer) {
            console.error("No local player set");
            return;
        }

        // Check if the cell is already solved
        if (this.board[row][col] !== 0) {
            console.log("This cell is already solved");
            return;
        }

        const difficultyScore = this.calculateDifficultyScore(row, col);
        const points = this.calculatePoints(difficultyScore);

        if (this.solution[row][col] === value) {
            this.localPlayer.addPoints(points);
            this.board[row][col] = value;
            this.cellColors[row][col] = this.localPlayer.color;

            if (!this.localPlayer.solvedCells) {
                this.localPlayer.solvedCells = [];
            }
            this.localPlayer.solvedCells.push({ row, col });

            this.network.broadcastMove({ row, col, value, playerId: this.localPlayer.id, points });
            this.animateCell(row, col, 'correct');
            this.showScoreChange(points);
            this.renderBoard(); // Re-render the board to update colors
        } else {
            const penalty = Math.max(1, Math.floor(points / 2)); // Penalty is half the potential points, minimum 1
            this.localPlayer.addPoints(-penalty);
            this.animateCell(row, col, 'incorrect');
            this.showScoreChange(-penalty);
        }

        this.updatePlayersDisplay();
        this.checkGameEnd();
    }

    calculateDifficultyScore(row, col) {
        const R = this.countFilledInRow(row);
        const C = this.countFilledInColumn(col);
        const B = this.countFilledInBox(row, col);
        const T = this.countTotalFilled();

        return 1 - ((R + C + B) / 24) * (T / 81);
    }

    calculatePoints(difficultyScore) {
        return 1 + Math.round(4 * difficultyScore);
    }

    countFilledInRow(row) {
        return this.board[row].filter(cell => cell !== 0).length;
    }

    countFilledInColumn(col) {
        return this.board.filter(row => row[col] !== 0).length;
    }

    countFilledInBox(row, col) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        let count = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[boxRow + i][boxCol + j] !== 0) {
                    count++;
                }
            }
        }
        return count;
    }

    countTotalFilled() {
        return this.board.flat().filter(cell => cell !== 0).length;
    }

    addInfoIcon() {
        const infoIcon = document.createElement('div');
        infoIcon.innerHTML = '&#9432;'; // Information source symbol
        infoIcon.className = 'info-icon';
        infoIcon.title = 'Click for scoring information';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <h3>Scoring System</h3>
            <p>Points are awarded based on the difficulty of each move:</p>
            <ul>
                <li>Easier moves: 1-2 points</li>
                <li>Average moves: 3 points</li>
                <li>Difficult moves: 4-5 points</li>
            </ul>
            <p>Difficulty increases when fewer numbers are filled in the row, column, and 3x3 box.</p>
            <p>Incorrect guesses: Penalty is half the potential points (rounded down, minimum 1 point)</p>
        `;
        
        infoIcon.appendChild(tooltip);
        
        infoIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            tooltip.classList.remove('show');
        });

        const gameContainer = document.getElementById('gameContainer');
        gameContainer.appendChild(infoIcon);
    }

    animateCell(row, col, type) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add(type === 'correct' ? 'correct-animation' : 'incorrect-animation');

        setTimeout(() => {
            cell.classList.remove('correct-animation', 'incorrect-animation');
            if (type === 'incorrect') {
                cell.classList.remove('user-input');
                cell.textContent = '';
            } else {
                cell.style.color = this.localPlayer.color;
            }
        }, 500);
    }

    showScoreChange(change) {
        const scoreChangeElement = document.createElement('div');
        scoreChangeElement.textContent = change > 0 ? `+${change}` : `${change}`;
        scoreChangeElement.className = `score-change ${change > 0 ? 'positive' : 'negative'}`;
        document.body.appendChild(scoreChangeElement);

        const cell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
        const rect = cell.getBoundingClientRect();
        scoreChangeElement.style.left = `${rect.left + rect.width / 2}px`;
        scoreChangeElement.style.top = `${rect.top + rect.height / 2}px`;

        // Force reflow
        scoreChangeElement.offsetHeight;

        scoreChangeElement.classList.add('show');

        setTimeout(() => {
            scoreChangeElement.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(scoreChangeElement);
            }, 500);
        }, 1000);
    }

    updatePlayersDisplay() {
        const playersElement = document.getElementById('players');
        if (playersElement) {
            playersElement.innerHTML = '';
            for (let [id, player] of this.players) {
                const playerElement = document.createElement('div');
                playerElement.className = 'player';
                playerElement.textContent = `${player.name}: ${player.points} points`;
                playerElement.style.backgroundColor = player.color;
                playerElement.style.color = this.getContrastColor(player.color);
                playersElement.appendChild(playerElement);
            }
        }
    }

    getContrastColor(hexcolor) {
        if (hexcolor.slice(0, 1) === '#') {
            hexcolor = hexcolor.slice(1);
        }

        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);

        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        return (yiq >= 128) ? 'black' : 'white';
    }

    addLocalPlayer() {
        this.localPlayer = new Player();
        this.players.set('local', this.localPlayer);
        this.updatePlayersDisplay();
    }

    setNetworkId(id) {
        if (this.localPlayer) {
            this.localPlayer.setId(id);
            this.players.delete('local');
            this.players.set(id, this.localPlayer);
            this.updatePlayersDisplay();
        }
    }

    addRemotePlayer(id) {
        if (!this.players.has(id)) {
            const player = new Player(id);
            this.players.set(id, player);
            this.updatePlayersDisplay();
        }
    }

    removePlayer(id) {
        this.players.delete(id);
        this.updatePlayersDisplay();
    }

    removeAllPlayers() {
        this.players.clear();
        this.localPlayer = null;
        this.updatePlayersDisplay();
    }

    handleRemoteMove(id, move) {
        const player = this.players.get(id);
        if (player && this.solution[move.row][move.col] === move.value) {
            // Check if the cell is already solved
            if (this.board[move.row][move.col] !== 0) {
                console.log("This cell is already solved");
                return;
            }

            this.board[move.row][move.col] = move.value;
            this.cellColors[move.row][move.col] = player.color;

            if (!player.solvedCells) {
                player.solvedCells = [];
            }
            player.solvedCells.push({ row: move.row, col: move.col });

            const cell = document.querySelector(`.cell[data-row="${move.row}"][data-col="${move.col}"]`);
            cell.textContent = move.value;
            cell.style.color = player.color;
            cell.classList.remove('user-input');
            this.animateCell(move.row, move.col, 'correct');
            player.addPoints(move.points);
            this.renderBoard(); // Re-render the board to update colors
        }

        this.updatePlayersDisplay();
        this.checkGameEnd();
    }

    updatePlayerPosition(id, position) {
        const playerMarker = document.getElementById(`player-marker-${id}`);
        if (!playerMarker) {
            const newMarker = document.createElement('div');
            newMarker.id = `player-marker-${id}`;
            newMarker.className = 'player-marker';
            newMarker.style.backgroundColor = this.players.get(id).color;
            document.getElementById('gameBoard').appendChild(newMarker);
        }

        const cell = document.querySelector(`.cell[data-row="${position.row}"][data-col="${position.col}"]`);
        if (cell) {
            const rect = cell.getBoundingClientRect();
            const marker = document.getElementById(`player-marker-${id}`);
            marker.style.left = `${rect.left}px`;
            marker.style.top = `${rect.top}px`;
        }
    }

    checkGameEnd() {
        if (this.isBoardFull()) {
            let winner = null;
            let maxPoints = -Infinity;
            for (let [id, player] of this.players) {
                if (player.points > maxPoints) {
                    maxPoints = player.points;
                    winner = player;
                }
            }
            alert(`Game Over! Winner: ${winner.name} with ${winner.points} points!`);
            this.stopChronometer();
        }
    }

    isBoardFull() {
        for (let row of this.board) {
            if (row.includes(0)) return false;
        }
        return true;
    }

    getGameState() {
        return {
            board: this.board,
            solution: this.solution,
            cellColors: this.cellColors,
            players: Array.from(this.players.values()).map(player => player.getState()),
            elapsedTime: this.getElapsedTime()
        };
    }

    setGameState(state) {
        this.board = state.board;
        this.solution = state.solution;
        this.cellColors = state.cellColors || Array(9).fill().map(() => Array(9).fill(null));
        this.renderBoard();

        this.players.clear();
        for (let playerState of state.players) {
            const player = new Player(playerState.id);
            player.setState(playerState);
            this.players.set(playerState.id, player);
            if (playerState.id === this.network.getMyId()) {
                this.localPlayer = player;
            }
        }

        this.updatePlayersDisplay();
        this.setElapsedTime(state.elapsedTime || 0);
    }

    startChronometer() {
        this.startTime = Date.now();
        this.chronometerInterval = setInterval(() => {
            this.updateChronometer();
        }, 1000);
    }

    stopChronometer() {
        if (this.chronometerInterval) {
            clearInterval(this.chronometerInterval);
        }
    }

    updateChronometer() {
        const elapsedTime = this.getElapsedTime();
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('chronometer').textContent = display;
    }

    getElapsedTime() {
        return Date.now() - this.startTime;
    }

    setElapsedTime(time) {
        this.startTime = Date.now() - time;
        this.updateChronometer();
    }

    resetGame() {
        this.stopChronometer();
        this.board = [];
        this.solution = [];
        this.cellColors = Array(9).fill().map(() => Array(9).fill(null));
        this.players.forEach(player => player.resetScore());
        this.init();
        this.updatePlayersDisplay();
    }

    highlightConflicts() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== 0) {
                    const value = this.board[i][j];
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    
                    // Check row and column
                    for (let k = 0; k < 9; k++) {
                        if (k !== j && this.board[i][k] === value) {
                            cell.classList.add('conflict');
                            document.querySelector(`.cell[data-row="${i}"][data-col="${k}"]`).classList.add('conflict');
                        }
                        if (k !== i && this.board[k][j] === value) {
                            cell.classList.add('conflict');
                            document.querySelector(`.cell[data-row="${k}"][data-col="${j}"]`).classList.add('conflict');
                        }
                    }
                    
                    // Check 3x3 box
                    let boxRow = Math.floor(i / 3) * 3;
                    let boxCol = Math.floor(j / 3) * 3;
                    for (let r = boxRow; r < boxRow + 3; r++) {
                        for (let c = boxCol; c < boxCol + 3; c++) {
                            if (r !== i && c !== j && this.board[r][c] === value) {
                                cell.classList.add('conflict');
                                document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`).classList.add('conflict');
                            }
                        }
                    }
                }
            }
        }
    }

    removeHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('conflict');
        });
    }

    hint() {
        if (!this.localPlayer) return;

        let emptyCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length === 0) return;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const hintValue = this.solution[randomCell.row][randomCell.col];

        this.localPlayer.addPoints(-1);  // Deduct a point for using a hint
        this.board[randomCell.row][randomCell.col] = hintValue;
        this.cellColors[randomCell.row][randomCell.col] = 'gray';  // Use a different color for hints

        this.renderBoard();
        this.updatePlayersDisplay();
        this.showScoreChange(-1);

        // Animate the hinted cell
        this.animateCell(randomCell.row, randomCell.col, 'hint');
    }

    undo() {
        if (!this.localPlayer || !this.localPlayer.solvedCells || this.localPlayer.solvedCells.length === 0) return;

        const lastMove = this.localPlayer.solvedCells.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.cellColors[lastMove.row][lastMove.col] = null;

        this.localPlayer.addPoints(-1);  // Deduct a point for undoing
        this.renderBoard();
        this.updatePlayersDisplay();
        this.showScoreChange(-1);
    }
}