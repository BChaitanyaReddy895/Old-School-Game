import { games } from '../games.js';

function calculateWinner(board) {
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
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const { gameNumber, index, symbol, playerId } = await req.json();
    
    // Convert index to number if it's a string
    const numericIndex = typeof index === 'string' ? parseInt(index, 10) : index;
    
    if (
      !gameNumber ||
      typeof numericIndex !== 'number' ||
      isNaN(numericIndex) ||
      numericIndex < 0 ||
      numericIndex > 8 ||
      !['X', 'O'].includes(symbol) ||
      !playerId ||
      !Object.prototype.hasOwnProperty.call(games, gameNumber)
    ) {
      console.error('Move validation failed:', { gameNumber, index, numericIndex, symbol, playerId, hasGame: Object.prototype.hasOwnProperty.call(games, gameNumber) });
      return Response.json({ success: false, message: 'Invalid move parameters.' }, { status: 400 });
    }
    const game = games[gameNumber];
    if (game.board[numericIndex] || game.winner || game.tie) {
      return Response.json({ success: false, message: 'Invalid move.' }, { status: 400 });
    }
    // Check player
    const player = game.players.find((p) => p.id === playerId);
    if (!player || player.symbol !== symbol) {
      return Response.json({ success: false, message: 'Unauthorized.' }, { status: 403 });
    }
    // Check turn
    if ((game.isXNext && symbol !== 'X') || (!game.isXNext && symbol !== 'O')) {
      return Response.json({ success: false, message: 'Not your turn.' }, { status: 400 });
    }
    game.board[numericIndex] = symbol;
    game.isXNext = !game.isXNext;
    const winner = calculateWinner(game.board);
    if (winner) {
      game.winner = winner;
    } else if (game.board.every((cell) => cell)) {
      game.tie = true;
    }
    return Response.json({ success: true, board: game.board, isXNext: game.isXNext, winner: game.winner, tie: game.tie });
  } catch (error) {
    console.error('Move API Error:', error);
    return Response.json({ success: false, message: 'Failed to process move.' }, { status: 500 });
  }
} 