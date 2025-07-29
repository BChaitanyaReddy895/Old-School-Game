import { games } from '../games.js';

export async function POST(req) {
  try {
    const { gameNumber, playerId } = await req.json();
    if (!gameNumber || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return Response.json({ success: false, message: 'Game not found.' }, { status: 404 });
    }
    const game = games[gameNumber];
    if (!game.playAgainRequests) game.playAgainRequests = [];
    if (!game.playAgainRequests.includes(playerId)) {
      game.playAgainRequests.push(playerId);
    }
    // Only reset if both players have requested
    if (game.players && game.playAgainRequests.length === 2) {
      game.board = Array(9).fill('');
      game.isXNext = true;
      game.winner = null;
      game.tie = false;
      game.playAgainRequests = [];
      return Response.json({ success: true, waiting: false });
    } else {
      return Response.json({ success: true, waiting: true });
    }
  } catch (error) {
    console.error('Reset API Error:', error);
    return Response.json({ success: false, message: 'Failed to reset game.' }, { status: 500 });
  }
} 