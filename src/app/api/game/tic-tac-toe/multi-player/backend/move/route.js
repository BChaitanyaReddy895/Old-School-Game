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
    if (
      !gameNumber ||
      typeof index !== 'number' ||
      !['X', 'O'].includes(symbol) ||
      !playerId ||
      !Object.prototype.hasOwnProperty.call(games, gameNumber)
    ) {
      return Response.json({ success: false, message: 'Invalid move parameters.' }, { status: 400 });
    }
    const game = games[gameNumber];
    if (game.board[index] || game.winner || game.tie) {
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
    game.board[index] = symbol;
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