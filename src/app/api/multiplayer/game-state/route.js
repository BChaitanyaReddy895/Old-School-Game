// In-memory game state store (module scope)
const games = global.games || (global.games = {});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gameNumber = searchParams.get('gameNumber');
    const playerId = searchParams.get('playerId');
    
    // Proper validation - check if gameNumber exists and is valid
    if (!gameNumber || gameNumber === '' || !games.hasOwnProperty(gameNumber)) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const game = games[gameNumber];
    let symbol = null;
    
    if (playerId && game.players) {
      const player = game.players.find(p => p.id === playerId);
      if (player) symbol = player.symbol;
    }
    
    // Ensure playAgainRequests exists
    if (!game.playAgainRequests) game.playAgainRequests = [];
    
    const response = { ...game, symbol };
    
    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export games for use in other API routes
export { games }; 