import { games } from '../games.js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let gameNumber = searchParams.get('gameNumber');
    
    // Validate gameNumber presence
    if (!gameNumber) {
      return Response.json({ success: false, message: 'Game number is required.' }, { status: 400 });
    }
    
    // Validate gameNumber type
    if (typeof gameNumber !== 'string') {
      return Response.json({ success: false, message: 'Game number must be a string.' }, { status: 400 });
    }
    
    // Trim and validate gameNumber is not empty after trimming
    gameNumber = gameNumber.trim();
    if (!gameNumber) {
      return Response.json({ success: false, message: 'Game number cannot be empty.' }, { status: 400 });
    }
    
    // Check if game exists
    if (!Object.prototype.hasOwnProperty.call(games, gameNumber)) {
      return Response.json({ success: false, message: 'Game not found.' }, { status: 404 });
    }
    const game = games[gameNumber];
    return Response.json({
      board: game.board,
      isXNext: game.isXNext,
      winner: game.winner,
      tie: game.tie,
      players: game.players,
      active: !game.winner && !game.tie && game.players.length === 2,
      playAgainRequests: game.playAgainRequests || [],
    });
  } catch (error) {
    console.error('Game State API Error:', error);
    return Response.json({ success: false, message: 'Failed to fetch game state.' }, { status: 500 });
  }
} 