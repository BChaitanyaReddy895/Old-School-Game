// In-memory game state store (module scope)
const games = global.games || (global.games = {});

export default async function handler(req, res) {
  const { gameNumber } = req.query;
  if (!gameNumber || !games[gameNumber]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  const game = games[gameNumber];
  res.status(200).json(game);
}

// Export games for use in other API routes
export { games }; 