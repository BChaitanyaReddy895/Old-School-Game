import { games } from '../games.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let gameNumber = searchParams.get('gameNumber');
    if (!gameNumber || typeof gameNumber !== 'string' || !(gameNumber = gameNumber.trim()) || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return Response.json({ success: false, message: 'Game not found.' }, { status: 404 });
    }
    const game = games[gameNumber];
    return Response.json({
      board: game.board,
      isXNext: game.isXNext,
      winner: game.winner,
      tie: game.tie,
      players: game.players,
      active: !game.winner && !game.tie && game.players.length === 2,
      playAgainRequests: game.playAgainRequests || [],
    });
  } catch (error) {
    console.error('Game State API Error:', error);
    return Response.json({ success: false, message: 'Failed to fetch game state.' }, { status: 500 });
  }
} 