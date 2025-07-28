import { games } from './game-state';

function generateUniqueGameNumber() {
  return Math.random().toString(36).substring(2, 9);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const gameNumber = generateUniqueGameNumber();
  games[gameNumber] = {
    board: Array(9).fill(null),
    isXNext: true,
    hasStarted: false,
    mySymbol: 'X',
    winner: null,
    tie: false,
    players: [],
  };
  res.status(200).json({ gameNumber });
} 