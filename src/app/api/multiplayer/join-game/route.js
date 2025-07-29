import { games } from '../shared/games.js';
import { randomUUID } from 'crypto';

function generatePlayerId() {
  // Use crypto.randomUUID for better uniqueness
  return randomUUID();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { gameNumber } = body;
    
    // Proper validation
    if (!gameNumber || gameNumber === '' || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const game = games[gameNumber];
    
    // Check if game has already started
    if (game.hasStarted) {
      return new Response(JSON.stringify({ error: 'Game has already started' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!game.players) game.players = [];
    
    // Atomic check and update to prevent race conditions
    if (game.players.length >= 2) {
      return new Response(JSON.stringify({ error: 'Game is already full' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const playerId = generatePlayerId();
    const newPlayer = { id: playerId, symbol: 'O' };
    
    // Atomic operation: check length again and add player
    if (game.players.length < 2) {
      game.players.push(newPlayer);
      
      if (game.players.length === 2) {
        game.hasStarted = true;
      }
    } else {
      return new Response(JSON.stringify({ error: 'Game is already full' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      playerId, 
      symbol: 'O',
      gameState: {
        board: game.board,
        isXNext: game.isXNext,
        hasStarted: game.hasStarted,
        winner: game.winner,
        tie: game.tie
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Join Game API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to join game' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 