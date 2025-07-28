import { games } from './game-state';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { gameNumber } = req.body;
  if (!gameNumber || !games[gameNumber]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  games[gameNumber].board = Array(9).fill(null);
  games[gameNumber].isXNext = true;
  games[gameNumber].winner = null;
  games[gameNumber].tie = false;
  res.status(200).json({ success: true });
} 