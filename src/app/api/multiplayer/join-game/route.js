import { games } from '../game-state/route';
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
    if (!gameNumber || gameNumber === '' || !games.hasOwnProperty(gameNumber)) {
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
    
    if (game.players.length >= 2) {
      return new Response(JSON.stringify({ error: 'Game is already full' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const playerId = generatePlayerId();
    game.players.push({ id: playerId, symbol: 'O' });
    
    if (game.players.length === 2) {
      game.hasStarted = true;
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
    return new Response(JSON.stringify({ error: 'Failed to join game' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 