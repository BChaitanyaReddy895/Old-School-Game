import { games } from '../game-state/route';

export async function POST(req) {
  const body = await req.json();
  const { gameNumber, playerId } = body;
  if (!gameNumber || !games[gameNumber]) {
    return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
  }
  const game = games[gameNumber];
  if (!game.playAgainRequests) game.playAgainRequests = [];
  if (!game.playAgainRequests.includes(playerId)) {
    game.playAgainRequests.push(playerId);
  }
  if (game.playAgainRequests.length === 2) {
    game.board = Array(9).fill(null);
    game.isXNext = true;
    game.winner = null;
    game.tie = false;
    game.playAgainRequests = [];
    return new Response(JSON.stringify({ status: 'reset' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ status: 'waiting' }), { status: 200 });
  }
} 