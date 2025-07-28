import { games } from '../game-state/route';

function generatePlayerId() {
  return Math.random().toString(36).substring(2, 12);
}

export async function POST(req) {
  const body = await req.json();
  const { gameNumber } = body;
  if (!gameNumber || !games[gameNumber]) {
    return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
  }
  const game = games[gameNumber];
  if (!game.players) game.players = [];
  if (game.players.length >= 2) {
    return new Response(JSON.stringify({ error: 'Game is already full' }), { status: 400 });
  }
  const playerId = generatePlayerId();
  game.players.push({ id: playerId, symbol: 'O' });
  if (game.players.length === 2) {
    game.hasStarted = true;
  }
  return new Response(JSON.stringify({ success: true, playerId, symbol: 'O' }), { status: 200 });
} 