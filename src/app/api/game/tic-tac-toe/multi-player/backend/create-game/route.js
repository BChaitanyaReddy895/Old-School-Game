import { games } from '../games.js';

export async function POST() {
  try {
    let gameNumber;
    do {
      gameNumber = 'GAME-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    } while (Object.prototype.hasOwnProperty.call(games, gameNumber));
    const playerId = crypto.randomUUID();
    games[gameNumber] = {
      board: Array(9).fill(''),
      isXNext: true,
      players: [{ id: playerId, symbol: 'X' }],
      hasStarted: false,
      winner: null,
      tie: false,
      createdAt: Date.now(),
    };
    return Response.json({ success: true, gameNumber, playerId });
  } catch (error) {
    console.error('Create Game API Error:', error);
    return Response.json({ success: false, message: 'Failed to create game.' }, { status: 500 });
  }
} 