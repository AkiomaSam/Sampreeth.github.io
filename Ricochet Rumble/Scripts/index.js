document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const player1TimerElement = document.getElementById('player1-timer');
    const player2TimerElement = document.getElementById('player2-timer');
    const tossHeadButton = document.getElementById('toss-head');
    const tossTailButton = document.getElementById('toss-tail');
    const pauseButton = document.getElementById('pause');
    const resetButton = document.getElementById('reset');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
  
    let boardState = Array(64).fill(null);
    let currentPlayer = 1; // 1 for player1, 2 for player2
    let player1Time = 300; // 5 minutes in seconds
    let player2Time = 300;
    let gameInterval;
    let isPaused = false;
  
    const pieces = [
      { type: 'titan', position: 0, player: 1 },
      { type: 'tank', position: 1, player: 1 },
      { type: 'ricochet', position: 2, player: 1 },
      { type: 'semi-ricochet', position: 3, player: 1 },
      { type: 'cannon', position: 7, player: 1 },
      { type: 'titan', position: 56, player: 2 },
      { type: 'tank', position: 57, player: 2 },
      { type: 'ricochet', position: 58, player: 2 },
      { type: 'semi-ricochet', position: 59, player: 2 },
      { type: 'cannon', position: 63, player: 2 },
    ];
  
    function initializeBoard() {
      pieces.forEach(piece => {
        const cell = board.children[piece.position];
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece', piece.type);
        pieceElement.dataset.player = piece.player;
        pieceElement.dataset.type = piece.type;
        cell.appendChild(pieceElement);
        boardState[piece.position] = piece;
      });
    }
  
    function movePiece(index, targetIndex) {
      const piece = boardState[index];
      const targetPiece = boardState[targetIndex];
      if (piece && (!targetPiece || targetPiece.player !== piece.player)) {
        const targetCell = board.children[targetIndex];
        const pieceElement = board.children[index].querySelector('.piece');
        targetCell.appendChild(pieceElement);
        boardState[targetIndex] = piece;
        boardState[index] = null;
        piece.position = targetIndex;
  
        // Implement shooting after the move
        shootCannon(piece.player);
        currentPlayer = 3 - currentPlayer;
      }
    }
  
    function shootCannon(player) {
      const cannon = pieces.find(p => p.type === 'cannon' && p.player === player);
      const bullet = document.createElement('div');
      bullet.classList.add('bullet');
      const cannonCell = board.children[cannon.position];
      cannonCell.appendChild(bullet);
      // Move the bullet across the board
      let bulletPosition = cannon.position;
      const interval = setInterval(() => {
        const nextPosition = bulletPosition + (player === 1 ? 1 : -1);
        if (nextPosition < 0 || nextPosition > 63) {
          clearInterval(interval);
          bullet.remove();
        } else {
          const nextCell = board.children[nextPosition];
          const nextPiece = boardState[nextPosition];
          if (nextPiece) {
            // Handle bullet hitting a piece
            if (nextPiece.type === 'titan') {
              alert(`Player ${player} wins!`);
              clearInterval(interval);
              resetGame();
            } else if (nextPiece.type === 'ricochet') {
              // Reflect the bullet
              bulletPosition = reflectBullet(bulletPosition, nextPiece.position);
            } else if (nextPiece.type === 'semi-ricochet') {
              // Reflect or disappear the bullet based on the side it hits
              bulletPosition = handleSemiRicochet(bulletPosition, nextPiece.position);
            } else if (nextPiece.type === 'tank') {
              // Pass through or disappear based on the side it hits
              bulletPosition = handleTank(bulletPosition, nextPiece.position);
            } else {
              clearInterval(interval);
              bullet.remove();
            }
          } else {
            bulletPosition = nextPosition;
            const currentCell = board.children[bulletPosition];
            currentCell.appendChild(bullet);
          }
        }
      }, 100);
    }
  
    function reflectBullet(position, ricochetPosition) {
      // Calculate reflection direction based on ricochet position
      const direction = (position < ricochetPosition) ? -1 : 1;
      return position + direction * 8; // Reflect vertically
    }
  
    function handleSemiRicochet(position, semiRicochetPosition) {
      // Handle reflection or disappearance based on the side hit
      const direction = (position < semiRicochetPosition) ? -1 : 1;
      if (direction === -1) {
        return position + direction * 7; // Reflect diagonally
      } else {
        return -1; // Bullet disappears
      }
    }
  
    function handleTank(position, tankPosition) {
      // Allow passing through or make bullet disappear based on the side hit
      const direction = (position < tankPosition) ? 1 : -1;
      if (direction === 1) {
        return position + direction * 8; // Pass through vertically
      } else {
        return -1; // Bullet disappears
      }
    }
  
    function startGame() {
      gameInterval = setInterval(updateTimers, 1000);
    }
  
    function updateTimers() {
      if (!isPaused) {
        if (currentPlayer === 1) {
          player1Time--;
          if (player1Time <= 0) {
            alert('Player 2 wins by timeout!');
            resetGame();
          }
        } else {
          player2Time--;
          if (player2Time <= 0) {
            alert('Player 1 wins by timeout!');
            resetGame();
          }
        }
        updateTimerDisplay();
      }
    }
  
    function updateTimerDisplay() {
      player1TimerElement.textContent = formatTime(player1Time);
      player2TimerElement.textContent = formatTime(player2Time);
    }
  
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
  
    function resetGame() {
      clearInterval(gameInterval);
      boardState = boardState.map(() => null);
      currentPlayer = 1;
      player1Time = 300;
      player2Time = 300;
      updateTimerDisplay();
      isPaused = false;
      board.innerHTML = '';
      initializeBoard();
    }
  
    pauseButton.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    });
  
    resetButton.addEventListener('click', resetGame);
  
    undoButton.addEventListener('click', () => {
      // Implement undo functionality
    });
  
    redoButton.addEventListener('click', () => {
      // Implement redo functionality
    });
  
    tossHeadButton.addEventListener('click', () => {
      const tossResult = Math.random() < 0.5 ? 'head' : 'tail';
      alert(`Toss result: ${tossResult}`);
      currentPlayer = tossResult === 'head' ? 1 : 2;
      startGame();
    });
  
    tossTailButton.addEventListener('click', () => {
      const tossResult = Math.random() < 0.5 ? 'head' : 'tail';
      alert(`Toss result: ${tossResult}`);
      currentPlayer = tossResult === 'tail' ? 1 : 2;
      startGame();
    });
  
    board.addEventListener('click', (e) => {
      if (e.target.classList.contains('cell') || e.target.classList.contains('piece')) {
        const index = parseInt(e.target.closest('.cell').dataset.index);
        // Implement logic to handle piece selection and movement
      }
    });
  
    initializeBoard();
  });
  
