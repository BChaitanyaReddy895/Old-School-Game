// Import cleanup function
import { cleanupGames } from '../../../../utils/gameLogic.js';
import { games } from '../shared/games.js';

export async function GET(req) {
  try {
    // Clean up old games periodically
    cleanupGames(games);
    
    const { searchParams } = new URL(req.url);
    const gameNumber = searchParams.get('gameNumber');
    const playerId = searchParams.get('playerId');
    
    // Input validation for gameNumber
    if (!gameNumber || gameNumber === '') {
      return new Response(JSON.stringify({ error: 'Invalid game number: missing or empty' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate gameNumber format (should be a string, not too long)
    if (typeof gameNumber !== 'string' || gameNumber.length > 50) {
      return new Response(JSON.stringify({ error: 'Invalid game number format' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Proper validation - check if gameNumber exists and is valid
    if (!Object.prototype.hasOwnProperty.call(games, gameNumber)) {
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
    console.error('Game State API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

 