import { games } from '../game-state/route';
import { randomUUID } from 'crypto';

function generateUniqueGameNumber() {
  // Use crypto.randomUUID for better uniqueness
  return randomUUID().replace(/-/g, '').substring(0, 8);
}

function generatePlayerId() {
  // Use crypto.randomUUID for better uniqueness
  return randomUUID();
}

export async function POST(req) {
  try {
    const playerId = generatePlayerId();
    let gameNumber = generateUniqueGameNumber();
    
    // Ensure gameNumber is unique
    while (games.hasOwnProperty(gameNumber)) {
      gameNumber = generateUniqueGameNumber();
    }
    
    games[gameNumber] = {
      board: Array(9).fill(null),
      isXNext: true,
      hasStarted: false,
      winner: null,
      tie: false,
      players: [{ id: playerId, symbol: 'X' }],
      playAgainRequests: [],
      createdAt: Date.now()
    };
    
    return new Response(JSON.stringify({ 
      gameNumber, 
      playerId, 
      symbol: 'X' 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create game' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 