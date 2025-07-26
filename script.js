document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = null;
    let scores = { xWins: 0, oWins: 0, ties: 0 };
    
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const playerTurnDisplay = document.getElementById('player-turn');
    const gameStatusDisplay = document.getElementById('game-status');
    const twoPlayerBtn = document.getElementById('two-player');
    const vsAiBtn = document.getElementById('vs-ai');
    const resetBtn = document.getElementById('reset');
    const xWinsDisplay = document.getElementById('x-wins');
    const oWinsDisplay = document.getElementById('o-wins');
    const tiesDisplay = document.getElementById('ties');
    
    // Audio elements
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');
    
    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize the game
    init();
    
    function init() {
        // Event listeners for cells
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
        
        // Event listeners for buttons
        twoPlayerBtn.addEventListener('click', () => setGameMode('two-player'));
        vsAiBtn.addEventListener('click', () => setGameMode('vs-ai'));
        resetBtn.addEventListener('click', resetGame);
        
        updateGameInfo();
        updateScores();
    }
    
    function setGameMode(mode) {
        gameMode = mode;
        gameStatusDisplay.innerHTML = `<i class="fas fa-${mode === 'two-player' ? 'users' : 'robot'}"></i> <span>${mode === 'two-player' ? 'Two Players' : 'VS AI'} Mode</span>`;
        resetGame();
        
        if (mode === 'vs-ai' && currentPlayer === 'O') {
            // AI makes the first move if it's O's turn
            setTimeout(makeAIMove, 500);
        }
    }
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell is already filled or game is not active, ignore the click
        if (board[clickedCellIndex] !== '' || !gameActive || !gameMode) {
            return;
        }
        
        // Play click sound
        clickSound.currentTime = 0;
        clickSound.play();
        
        // Process the move
        processMove(clickedCell, clickedCellIndex);
        
        // If in vs AI mode and game is still active, let AI make a move
        if (gameMode === 'vs-ai' && gameActive && currentPlayer === 'O') {
            setTimeout(makeAIMove, 800);
        }
    }
    
    function processMove(cell, index) {
        // Update the board and UI
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Add animation class
        cell.classList.add('animate__animated', 'animate__zoomIn');
        
        // Remove animation class after it completes
        setTimeout(() => {
            cell.classList.remove('animate__animated', 'animate__zoomIn');
        }, 500);
        
        // Check for win or draw
        if (checkWin()) {
            endGame(false);
            return;
        } else if (checkDraw()) {
            endGame(true);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameInfo();
    }
    
    function makeAIMove() {
        if (!gameActive || gameMode !== 'vs-ai') return;
        
        // Simple AI: first try to win, then block, then choose center, then corners, then random
        let move;
        
        // 1. Check if AI can win
        move = findWinningMove('O');
        if (move === null) {
            // 2. Check if AI needs to block
            move = findWinningMove('X');
        }
        
        if (move === null) {
            // 3. Choose center if available
            if (board[4] === '') {
                move = 4;
            } else {
                // 4. Choose a random corner
                const corners = [0, 2, 6, 8];
                const availableCorners = corners.filter(index => board[index] === '');
                if (availableCorners.length > 0) {
                    move = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                } else {
                    // 5. Choose any available cell
                    const availableCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
                    if (availableCells.length > 0) {
                        move = availableCells[Math.floor(Math.random() * availableCells.length)];
                    }
                }
            }
        }
        
        if (move !== null) {
            const cell = document.querySelector(`.cell[data-index="${move}"]`);
            // Play click sound for AI move
            clickSound.currentTime = 0;
            clickSound.play();
            processMove(cell, move);
        }
    }
    
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            // Check if two cells are filled by the player and third is empty
            if (board[a] === player && board[b] === player && board[c] === '') {
                return c;
            } else if (board[a] === player && board[c] === player && board[b] === '') {
                return b;
            } else if (board[b] === player && board[c] === player && board[a] === '') {
                return a;
            }
        }
        return null;
    }
    
    function checkWin() {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                // Highlight winning cells
                const winningCells = document.querySelectorAll(`.cell[data-index="${a}"], .cell[data-index="${b}"], .cell[data-index="${c}"]`);
                winningCells.forEach(cell => {
                    cell.classList.add('winning-cell');
                });
                return true;
            }
        }
        return false;
    }
    
    function checkDraw() {
        return !board.includes('');
    }
    
    function endGame(isDraw) {
        gameActive = false;
        
        if (isDraw) {
            scores.ties++;
            gameStatusDisplay.innerHTML = `<i class="fas fa-handshake"></i> <span>Game ended in a draw!</span>`;
            drawSound.play();
        } else {
            const winner = currentPlayer;
            if (winner === 'X') {
                scores.xWins++;
                gameStatusDisplay.innerHTML = `<i class="fas fa-trophy" style="color: var(--neon-blue)"></i> <span>Player X wins!</span>`;
            } else {
                scores.oWins++;
                gameStatusDisplay.innerHTML = `<i class="fas fa-trophy" style="color: var(--neon-pink)"></i> <span>Player O wins!</span>`;
            }
            winSound.play();
        }
        
        updateScores();
    }
    
    function updateGameInfo() {
        const playerIcon = currentPlayer === 'X' ? '<i class="fas fa-user" style="color: var(--neon-blue)"></i>' : 
                                                '<i class="fas fa-robot" style="color: var(--neon-pink)"></i>';
        playerTurnDisplay.innerHTML = `${playerIcon} <span>Player ${currentPlayer}'s Turn</span>`;
    }
    
    function updateScores() {
        xWinsDisplay.textContent = scores.xWins;
        oWinsDisplay.textContent = scores.oWins;
        tiesDisplay.textContent = scores.ties;
    }
    
    function resetGame() {
        // Reset game state
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        // Reset UI
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell', 'animate__animated', 'animate__zoomIn');
        });
        
        updateGameInfo();
        
        // If in vs AI mode and AI goes first, make the first move
        if (gameMode === 'vs-ai' && currentPlayer === 'O') {
            setTimeout(makeAIMove, 800);
        }
    }
});