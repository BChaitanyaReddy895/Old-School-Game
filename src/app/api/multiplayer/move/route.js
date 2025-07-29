import { games } from '../shared/games.js';
import { calculateWinner, isBoardFull } from '../../../../utils/gameLogic.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { gameNumber, index, symbol, playerId } = body;
    
    // Input validation
    if (!gameNumber || gameNumber === '' || !Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const game = games[gameNumber];
    
    // Security check: Verify player is part of the game
    if (!playerId || !game.players || !game.players.some(p => p.id === playerId)) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Player not part of this game' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate index is a number within valid range
    if (typeof index !== 'number' || index < 0 || index > 8) {
      return new Response(JSON.stringify({ error: 'Invalid move position' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate symbol
    if (!['X', 'O'].includes(symbol)) {
      return new Response(JSON.stringify({ error: 'Invalid symbol' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if game has ended
    if (game.winner || game.tie) {
      return new Response(JSON.stringify({ error: 'Game has already ended' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if cell is already occupied
    if (game.board[index] !== null) {
      return new Response(JSON.stringify({ error: 'Cell already occupied' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate turn
    const expectedSymbol = game.isXNext ? 'X' : 'O';
    if (symbol !== expectedSymbol) {
      return new Response(JSON.stringify({ error: 'Not your turn' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Make the move
    game.board[index] = symbol;
    game.isXNext = !game.isXNext;
    
    // Check for winner or tie
    const winner = calculateWinner(game.board);
    game.winner = winner;
    game.tie = !winner && isBoardFull(game.board);
    
    return new Response(JSON.stringify({ 
      success: true,
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
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to make move' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 