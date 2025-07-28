import { games } from './game-state';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { gameNumber, index, symbol } = req.body;
  if (!gameNumber || !games[gameNumber]) {
    return res.status(404).json({ error: 'Game not found' });
  }
  const game = games[gameNumber];
  if (game.board[index] || game.winner) {
    return res.status(400).json({ error: 'Invalid move' });
  }
  game.board[index] = symbol;
  game.isXNext = !game.isXNext;
  const winner = calculateWinner(game.board);
  game.winner = winner;
  game.tie = !winner && game.board.every(cell => cell !== null);
  res.status(200).json({ success: true });
} 