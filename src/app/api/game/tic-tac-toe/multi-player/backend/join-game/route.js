import { games } from '../games.js';

export async function POST(req) {
  try {
    const { gameNumber } = await req.json();
    if (!gameNumber || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return Response.json({ success: false, message: 'Game not found.' }, { status: 404 });
    }
    const game = games[gameNumber];
    if (game.players.length >= 2) {
      return Response.json({ success: false, message: 'Game is full.' }, { status: 400 });
    }
    const playerId = crypto.randomUUID();
    game.players.push({ id: playerId, symbol: 'O' });
    game.hasStarted = true;
    return Response.json({ success: true, playerId });
  } catch (error) {
    console.error('Join Game API Error:', error);
    return Response.json({ success: false, message: 'Failed to join game.' }, { status: 500 });
  }
} 