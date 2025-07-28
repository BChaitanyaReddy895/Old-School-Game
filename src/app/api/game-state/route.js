// In-memory game state store (module scope)
const games = global.games || (global.games = {});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const gameNumber = searchParams.get('gameNumber');
  const playerId = searchParams.get('playerId');
  if (!gameNumber || !games[gameNumber]) {
    return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
  }
  const game = games[gameNumber];
  let symbol = null;
  if (playerId && game.players) {
    const player = game.players.find(p => p.id === playerId);
    if (player) symbol = player.symbol;
  }
  // Ensure playAgainRequests exists
  if (!game.playAgainRequests) game.playAgainRequests = [];
  return new Response(JSON.stringify({ ...game, symbol }), { status: 200 });
}

// Export games for use in other API routes
export { games }; 