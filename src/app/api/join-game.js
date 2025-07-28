import { games } from './game-state';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { gameNumber } = req.body;
  if (!gameNumber || !games[gameNumber]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  const game = games[gameNumber];
  if (!game.players) game.players = [];
  if (game.players.length >= 2) {
    return res.status(400).json({ error: 'Game is already full' });
  }
  game.players.push({ id: Math.random().toString(36).substring(2, 9) });
  if (game.players.length === 2) {
    game.hasStarted = true;
  }
  res.status(200).json({ success: true });
} 