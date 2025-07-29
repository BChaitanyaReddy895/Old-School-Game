import { games } from '../game-state/route';

function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { gameNumber, index, symbol } = body;
    
    // Input validation
    if (!gameNumber || gameNumber === '' || !games.hasOwnProperty(gameNumber)) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { 
        status: 404,
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
    
    const game = games[gameNumber];
    
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
    game.tie = !winner && game.board.every(cell => cell !== null);
    
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