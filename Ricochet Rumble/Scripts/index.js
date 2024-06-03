class Game {
    constructor() {
        this.board = this.createBoard();
        this.setupBoard();
        this.setupControls();
        this.currentPlayer = 'black';
        this.paused = false;
        this.history = [];
        this.redoStack = [];
        this.timerBlack = 300; // 5 minutes in seconds
        this.timerWhite = 300; // 5 minutes in seconds
        this.startTimers();
    }

    createBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            const rowArray = [];
            for (let col = 0; col < 8; col++) {
                rowArray.push(null);
            }
            board.push(rowArray);
        }
        return board;
    }

    setupBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
        this.placePieces();
        this.setupClickHandlers();
    }

    placePieces() {
        this.addPiece(0, 0, 'tank', 'black');
        this.addPiece(0, 1, 'ricochet', 'black');
        this.addPiece(0, 2, 'semi-ricochet', 'black');
        this.addPiece(0, 3, 'titan', 'black');
        this.addPiece(0, 4, 'semi-ricochet', 'black');
        this.addPiece(0, 5, 'ricochet', 'black');
        this.addPiece(0, 6, 'tank', 'black');
        this.addPiece(0, 7, 'cannon', 'black');

        this.addPiece(7, 0, 'tank', 'white');
        this.addPiece(7, 1, 'ricochet', 'white');
        this.addPiece(7, 2, 'semi-ricochet', 'white');
        this.addPiece(7, 3, 'titan', 'white');
        this.addPiece(7, 4, 'semi-ricochet', 'white');
        this.addPiece(7, 5, 'ricochet', 'white');
        this.addPiece(7, 6, 'tank', 'white');
        this.addPiece(7, 7, 'cannon', 'white');
    }

    addPiece(row, col, type, player) {
        const piece = document.createElement('div');
        piece.classList.add('piece', type);
        piece.dataset.player = player;
        piece.dataset.type = type;
        piece.dataset.row = row;
        piece.dataset.col = col;
        piece.innerText = player === 'black' ? '1' : '2';

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.appendChild(piece);
        this.board[row][col] = piece;
    }

    selectPiece(piece) {
        if (this.paused) return;
        if (piece.dataset.player !== this.currentPlayer) return;

        const selectedPiece = document.querySelector('.selected');
        if (selectedPiece) {
            selectedPiece.classList.remove('selected');
            this.clearValidMoves();
        }
        piece.classList.add('selected');
        this.showValidMoves(piece);
    }

    movePiece(piece, newRow, newCol) {
        const oldRow = parseInt(piece.dataset.row);
        const oldCol = parseInt(piece.dataset.col);

        if (this.isValidMove(piece, newRow, newCol)) {
            this.history.push(this.board.map(row => row.slice())); // Save current state for undo
            this.redoStack = []; // Clear redo stack
            this.board[oldRow][oldCol] = null; // Clear old position
            this.board[newRow][newCol] = piece;
            piece.dataset.row = newRow;
            piece.dataset.col = newCol;

            const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
            cell.appendChild(piece);

            this.clearValidMoves();
            this.switchPlayer();
        }
    }

    isValidMove(piece, newRow, newCol) {
        const oldRow = parseInt(piece.dataset.row);
        const oldCol = parseInt(piece.dataset.col);
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    showValidMoves(piece) {
        const row = parseInt(piece.dataset.row);
        const col = parseInt(piece.dataset.col);
        const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 },
        ];

        directions.forEach(dir => {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            if (this.isWithinBounds(newRow, newCol) && !this.board[newRow][newCol]) {
                const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                const marker = document.createElement('div');
                marker.classList.add('valid-move');
                cell.appendChild(marker);
                marker.addEventListener('click', () => this.movePiece(piece, newRow, newCol));
            }
        });
    }

    clearValidMoves() {
        document.querySelectorAll('.valid-move').forEach(marker => marker.remove());
    }

    isWithinBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }

    shootCannon(player) {
        const opponent = player === 'black' ? 'white' : 'black';
        const cannon = document.querySelector(`.piece.cannon[data-player="${player}"]`);
        if (!cannon) return;

        const cannonRow = parseInt(cannon.dataset.row);
        const cannonCol = parseInt(cannon.dataset.col);
        const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 },
        ];

        directions.forEach(dir => {
            let row = cannonRow;
            let col = cannonCol;

            while (this.isWithinBounds(row + dir.dr, col + dir.dc)) {
                row += dir.dr;
                col += dir.dc;
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (this.board[row][col]) {
                    if (this.board[row][col].dataset.player === opponent) {
                        this.board[row][col].remove();
                        this.board[row][col] = null;
                    }
                    break;
                } else {
                    const bullet = document.createElement('div');
                    bullet.classList.add('bullet');
                    cell.appendChild(bullet);
                    setTimeout(() => bullet.remove(), 300);
                }
            }
        });
    }

    startTimers() {
        this.timerInterval = setInterval(() => {
            if (!this.paused) {
                if (this.currentPlayer === 'black') {
                    this.timerBlack--;
                    if (this.timerBlack <= 0) {
                        this.declareWinner('white');
                    }
                } else {
                    this.timerWhite--;
                    if (this.timerWhite <= 0) {
                        this.declareWinner('black');
                    }
                }
                this.updateTimers();
            }
        }, 1000);
    }

    updateTimers() {
        const formatTime = time => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        document.getElementById('top-timer').innerText = formatTime(this.timerBlack);
        document.getElementById('bottom-timer').innerText = formatTime(this.timerWhite);
    }

    declareWinner(winner) {
        clearInterval(this.timerInterval);
        alert(`${winner === 'black' ? 'Player 1' : 'Player 2'} wins!`);
        this.resetGame();
    }

    resetGame() {
        this.board = this.createBoard();
        this.setupBoard();
        this.currentPlayer = 'black';
        this.timerBlack = 300;
        this.timerWhite = 300;
        this.startTimers();
    }

    pauseResumeGame() {
        this.paused = !this.paused;
        document.getElementById('pause-resume-button').innerText = this.paused ? 'Resume' : 'Pause';
    }

    undo() {
        if (this.history.length > 0) {
            this.redoStack.push(this.board.map(row => row.slice()));
            this.board = this.history.pop();
            this.setupBoard();
            this.switchPlayer();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            this.history.push(this.board.map(row => row.slice()));
            this.board = this.redoStack.pop();
            this.setupBoard();
            this.switchPlayer();
        }
    }

    setupControls() {
        document.getElementById('pause-resume-button').addEventListener('click', () => this.pauseResumeGame());
        document.getElementById('reset-button').addEventListener('click', () => this.resetGame());
        document.getElementById('undo-button').addEventListener('click', () => this.undo());
        document.getElementById('redo-button').addEventListener('click', () => this.redo());
    }

    setupClickHandlers() {
        document.querySelectorAll('.piece').forEach(piece => {
            piece.addEventListener('click', () => this.selectPiece(piece));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
