import { games } from '../shared/games.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { gameNumber, playerId } = body;
    
    // Proper validation
    if (!gameNumber || gameNumber === '' || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!playerId) {
      return new Response(JSON.stringify({ error: 'Player ID required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const game = games[gameNumber];
    
    if (!game.playAgainRequests) game.playAgainRequests = [];
    
    // Add player to play again requests if not already there
    if (!game.playAgainRequests.includes(playerId)) {
      game.playAgainRequests.push(playerId);
    }
    
    // Reset game if both players have requested
    if (game.playAgainRequests.length === 2) {
      game.board = Array(9).fill(null);
      game.isXNext = true;
      game.winner = null;
      game.tie = false;
      game.playAgainRequests = [];
      
      return new Response(JSON.stringify({ 
        status: 'reset',
        gameState: {
          board: game.board,
          isXNext: game.isXNext,
          winner: game.winner,
          tie: game.tie
        }
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        status: 'waiting',
        waitingCount: game.playAgainRequests.length
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to reset game' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 