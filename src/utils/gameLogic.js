/**
 * Calculate the winner of a Tic-Tac-Toe game
 * @param {Array} board - The game board array
 * @returns {string|null} - The winning symbol ('X' or 'O') or null if no winner
 */
export const calculateWinner = (board) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

/**
 * Check if the board is full (tie game)
 * @param {Array} board - The game board array
 * @returns {boolean} - True if board is full, false otherwise
 */
export const isBoardFull = (board) => {
    return board.every(cell => cell !== null);
};

/**
 * Get available empty indices on the board
 * @param {Array} board - The game board array
 * @returns {Array} - Array of empty indices
 */
export const getEmptyIndices = (board) => {
    return board
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
};

/**
 * Clean up finished or inactive games
 * @param {Object} games - The games object
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 */
export const cleanupGames = (games, maxAge = 60 * 60 * 1000) => {
  const now = Date.now();
  const gameNumbers = Object.keys(games);
  const gamesToDelete = [];
  
  gameNumbers.forEach(gameNumber => {
    const game = games[gameNumber];
    
    // Skip games that don't exist or lack required properties
    if (!game || typeof game !== 'object') {
      return;
    }
    
    // Ensure createdAt exists before using it
    if (!game.createdAt || typeof game.createdAt !== 'number') {
      return;
    }
    
    // Remove games that are finished and older than maxAge
    if (game.winner || game.tie) {
      if (now - game.createdAt > maxAge) {
        gamesToDelete.push(gameNumber);
      }
    }
    
    // Remove games that haven't started and are older than 30 minutes
    if (!game.hasStarted && now - game.createdAt > 30 * 60 * 1000) {
      gamesToDelete.push(gameNumber);
    }
  });
  
  // Delete games after iteration to avoid mutation during iteration
  gamesToDelete.forEach(gameNumber => {
    delete games[gameNumber];
  });
}; 