import { games } from '../games.js';

export async function POST(req) {
  try {
    let { gameNumber, playerId } = await req.json();
    if (!gameNumber || typeof gameNumber !== 'string' || !(gameNumber = gameNumber.trim()) || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return Response.json({ success: false, message: 'Game not found.' }, { status: 404 });
    }
    const game = games[gameNumber];
    // Validate playerId is one of the game's players
    if (!game.players || !game.players.some(p => p.id === playerId)) {
      return Response.json({ success: false, message: 'Unauthorized player.' }, { status: 403 });
    }
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