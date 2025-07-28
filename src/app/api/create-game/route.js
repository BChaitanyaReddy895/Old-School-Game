import { games } from '../game-state/route';

function generateUniqueGameNumber() {
  return Math.random().toString(36).substring(2, 9);
}
function generatePlayerId() {
  return Math.random().toString(36).substring(2, 12);
}

export async function POST(req) {
  const playerId = generatePlayerId();
  const gameNumber = generateUniqueGameNumber();
  games[gameNumber] = {
    board: Array(9).fill(null),
    isXNext: true,
    hasStarted: false,
    winner: null,
    tie: false,
    players: [{ id: playerId, symbol: 'X' }],
  };
  return new Response(JSON.stringify({ gameNumber, playerId, symbol: 'X' }), { status: 200 });
} 