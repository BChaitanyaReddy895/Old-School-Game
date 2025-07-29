type Board = (null | "X" | "O") []; // Type definition for the Tic-Tac-Toe board

/**
 * The `hardMinimax` function implements the minimax algorithm with alpha-beta pruning.
 * It evaluates the best move for the computer player in a Tic-Tac-Toe game.
 *
 * @param board - The current state of the board, where `null` indicates an empty cell, "X" is the computer's move, and "O" is the human's move.
 * @param depth - The current depth of the recursion. It helps in scoring the moves based on how far they are in the game tree.
 * @param isMaximizing - A boolean value that indicates if the current player is the maximizing player (true) or minimizing player (false).
 * @param alpha - The best value that the maximizing player can guarantee at that level or above.
 * @param beta - The best value that the minimizing player can guarantee at that level or below.
 * @param computerSymbol - The symbol of the computer player ("X" or "O").
 * @returns The best score for the current move.
 */
export const hardMinimax = (
    board: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    computerSymbol: "X" | "O" // Symbol for the computer player
): number => {
    const human = computerSymbol === 'X' ? 'O' : 'X';

    // Check if there's a winner or if the game is a tie
    const winner = checkWin(board);
    if (winner === computerSymbol) return 10 - depth; // If computer wins, return a high score
    if (winner === human) return depth - 10; // If human wins, return a low score
    if (emptyIndices(board).length === 0) return 0; // If the board is full and no winner, return 0 (draw)

    if (isMaximizing) { // If it's the computer's turn (maximizing player)
        let maxEval = -Infinity; // Initialize the best score as very low
        for (const index of emptyIndices(board)) { // Iterate over all empty cells
            board[index] = computerSymbol; // Try placing the computer's move at the current empty cell
            const evalScore = hardMinimax(board, depth + 1, false, alpha, beta, computerSymbol); // Evaluate the score for this move
            board[index] = null; // Undo the move
            maxEval = Math.max(maxEval, evalScore); // Update the best score if this move is better
            alpha = Math.max(alpha, evalScore); // Update alpha to the maximum value found
            if (beta <= alpha) break; // Prune the branch if the beta value is less than or equal to alpha
        }
        return maxEval; // Return the best score for the maximizing player
    } else { // If it's the human's turn (minimizing player)
        let minEval = Infinity; // Initialize the best score as very high
        for (const index of emptyIndices(board)) { // Iterate over all empty cells
            board[index] = human; // Try placing the human's move at the current empty cell
            const evalScore = hardMinimax(board, depth + 1, true, alpha, beta, computerSymbol); // Evaluate the score for this move
            board[index] = null; // Undo the move
            minEval = Math.min(minEval, evalScore); // Update the best score if this move is better
            beta = Math.min(beta, evalScore); // Update beta to the minimum value found
            if (beta <= alpha) break; // Prune the branch if the beta value is less than or equal to alpha
        }
        return minEval; // Return the best score for the minimizing player
    }
};

/**
 * The `getBestMove` function determines the best move for the computer player.
 *
 * @param board - The current state of the board.
 * @param computerSymbol - The symbol of the computer player ("X" or "O").
 * @returns The index of the best move that the computer should make.
 */
export const getBestMove = (board: Board, computerSymbol: "X" | "O"): number => {
    let bestMove = -1; // Initialize the best move index
    let bestScore = -Infinity; // Initialize the best score as very low

    // Validate input
    if (!board || board.length !== 9) {
        throw new Error('Invalid board state');
    }

    if (!['X', 'O'].includes(computerSymbol)) {
        throw new Error('Invalid computer symbol');
    }

    // Iterate over all empty cells to find the best move
    for (const index of emptyIndices(board)) {
        board[index] = computerSymbol; // Try placing the computer's move at the current empty cell
        const moveScore = hardMinimax(board, 0, false, -Infinity, Infinity, computerSymbol); // Evaluate the move using minimax
        board[index] = null; // Undo the move
        if (moveScore > bestScore) { // Update the best move if this move has a better score
            bestScore = moveScore;
            bestMove = index;
        }
    }

    // Validate that we found a valid move
    if (bestMove === -1) {
        throw new Error('No valid move found');
    }

    return bestMove; // Return the index of the best move
};

/**
 * Helper function to find the indices of empty spots on the board.
 *
 * @param board - The current state of the board.
 * @returns An array of indices where the board is empty.
 */
const emptyIndices = (board: Board): number[] => {
    if (!board || board.length !== 9) {
        return [];
    }
    
    return board
        .map((value, index) => value === null ? index : null)
        .filter((val): val is number => val !== null);
};

/**
 * The `checkWin` function checks if there is a winner on the board.
 *
 * @param board - The current state of the board.
 * @returns The winning player ("X" or "O") or `null` if there is no winner.
 */
const checkWin = (board: Board): "X" | "O" | null => {
    if (!board || board.length !== 9) {
        return null;
    }
    
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    // Check each win pattern to see if there's a winner
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] as "X" | "O"; // Return the winner ("X" or "O")
        }
    }
    return null; // No winner found
};
