"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";

const MOVE_TIME_LIMIT = 10; // seconds per move
const GAME_TIME_LIMIT = 5 * 60; // 5 minutes in seconds

function pad(num) {
  return num.toString().padStart(2, "0");
}

const initialBoard = Array(9).fill("");

export default function MultiplayerTicTacToe() {
  // Game state
  const [board, setBoard] = useState(initialBoard);
  const [isXNext, setIsXNext] = useState(true);
    const [gameActive, setGameActive] = useState(false);
  const [winner, setWinner] = useState(null);
  const [tie, setTie] = useState(false);
  const [mySymbol, setMySymbol] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [gameNumber, setGameNumber] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [moveTimer, setMoveTimer] = useState(MOVE_TIME_LIMIT);
  const [gameTimer, setGameTimer] = useState(GAME_TIME_LIMIT);
  const [moveTimerActive, setMoveTimerActive] = useState(false);
  const [gameTimerActive, setGameTimerActive] = useState(false);
  const moveTimerRef = useRef();
  const gameTimerRef = useRef();
  const [showGameCode, setShowGameCode] = useState(false);
  // 1. Add a new state to track if both players have joined
  const [bothPlayersJoined, setBothPlayersJoined] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [playAgainRequested, setPlayAgainRequested] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [playAgainError, setPlayAgainError] = useState("");
  const [turnSkipped, setTurnSkipped] = useState(false);
  const [turnSkippedMessage, setTurnSkippedMessage] = useState("");

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/tic-tac-toe/multi-player/backend/create-game", { method: "POST" });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setGameNumber(data.gameNumber);
        setPlayerId(data.playerId);
        setMySymbol("X");
        setShowGameCode(true);
        setWinner(null);
        setTie(false);
        setMoveTimer(MOVE_TIME_LIMIT);
        setGameTimer(GAME_TIME_LIMIT);
        setMoveTimerActive(false);
        setGameTimerActive(false);
        setTurnSkipped(false);
        setTurnSkippedMessage("");
        setTimeout(fetchGameState, 100);
      } else {
        alert(data.message || "Failed to create game. Please try again.");
      }
    } catch (error) {
      alert("Unable to create game. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/tic-tac-toe/multi-player/backend/join-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameNumber: joinCode })
      });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setGameNumber(joinCode);
        setPlayerId(data.playerId);
        setMySymbol("O");
        setShowGameCode(false);
        setWinner(null);
        setTie(false);
        setMoveTimer(MOVE_TIME_LIMIT);
        setGameTimer(GAME_TIME_LIMIT);
        setMoveTimerActive(true);
        setGameTimerActive(true);
        setTurnSkipped(false);
        setTurnSkippedMessage("");
        setTimeout(fetchGameState, 100);
      } else {
        alert(data.message || "Failed to join game. Please check the game code.");
      }
    } catch (error) {
      alert("Unable to join game. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    if (!gameNumber) return;
    try {
      const res = await fetch(`/api/game/tic-tac-toe/multi-player/backend/game-state?gameNumber=${gameNumber}`);
      if (!res.ok) {
        console.error(`Failed to fetch game state: ${res.status}`);
        return;
      }
      const data = await res.json();
      setBoard(data.board);
      setIsXNext(data.isXNext);
      setWinner(data.winner);
      setTie(data.tie);
      setGameActive(data.active);
      setBothPlayersJoined(data.players && data.players.length === 2);
      if (data.players && data.players.length === 2) {
        setShowGameCode(false);
        setMoveTimerActive(true);
        setGameTimerActive(true);
      }
      if (data.winner || data.tie) {
        setMoveTimerActive(false);
        setGameTimerActive(false);
      }
      // Show waiting message to both if only one has requested
      if (data.playAgainRequests && data.playAgainRequests.length === 1 && (winner || tie)) {
        setWaitingForOpponent(true);
      } else {
        setWaitingForOpponent(false);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, [gameNumber, tie, winner]);

  // Polling
  useEffect(() => {
    let interval;
    if (gameNumber) {
      interval = setInterval(fetchGameState, 1000);
      fetchGameState(); // Fetch immediately for instant update
    }
    return () => clearInterval(interval);
  }, [gameNumber, fetchGameState]);

    // Move timer
  useEffect(() => {
    if (!moveTimerActive) return;
    if (moveTimer <= 0) {
      setMoveTimerActive(false);
      // Auto-skip turn when timer expires
      if (gameActive && !winner && !tie) {
        setTurnSkipped(true);
        setTurnSkippedMessage("Time's up! Your turn was skipped.");
        // Reset timer for next turn
        setMoveTimer(MOVE_TIME_LIMIT);
        // Clear the message after 3 seconds
        setTimeout(() => {
          setTurnSkipped(false);
          setTurnSkippedMessage("");
        }, 3000);
      }
      return;
    }
    moveTimerRef.current = setTimeout(() => setMoveTimer((t) => t - 1), 1000);
    return () => clearTimeout(moveTimerRef.current);
  }, [moveTimer, moveTimerActive, gameActive, winner, tie]);

  // Game timer
  useEffect(() => {
    if (!gameTimerActive) return;
    if (gameTimer <= 0) {
      setGameTimerActive(false);
      setTie(true);
      setGameActive(false);
            return;
        }
    gameTimerRef.current = setTimeout(() => setGameTimer((t) => t - 1), 1000);
    return () => clearTimeout(gameTimerRef.current);
  }, [gameTimer, gameTimerActive]);

  // Copy game code
  const handleCopy = () => {
    navigator.clipboard.writeText(gameNumber);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 1500);
  };

  // Handle move
  const handleClick = async (index) => {
    if (!gameActive || board[index] || winner || tie || turnSkipped) return;
    if ((isXNext && mySymbol !== "X") || (!isXNext && mySymbol !== "O")) return;
    setLoading(true);
    try {
      const moveData = { gameNumber, index, symbol: mySymbol, playerId };
      console.log('Sending move data:', moveData);
      const res = await fetch("/api/game/tic-tac-toe/multi-player/backend/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moveData)
      });
      const data = await res.json();
      console.log('Move response:', data);
      if (data.success) {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setWinner(data.winner);
        setTie(data.tie);
        setMoveTimer(MOVE_TIME_LIMIT);
        setTurnSkipped(false); // Reset turn skipped state when move is successful
      } else {
        console.error('Move failed:', data.message);
        setTurnSkippedMessage(data.message || "Invalid move. Please try again.");
        setTurnSkipped(true);
        setTimeout(() => {
          setTurnSkipped(false);
          setTurnSkippedMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error('Network error during move:', error);
      setTurnSkippedMessage("Network error. Please try again.");
      setTurnSkipped(true);
      setTimeout(() => {
        setTurnSkipped(false);
        setTurnSkippedMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    setPlayAgainRequested(true);
    setWaitingForOpponent(false);
    setPlayAgainError("");
    try {
      const res = await fetch("/api/game/tic-tac-toe/multi-player/backend/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameNumber, playerId })
      });
      const data = await res.json();
      if (data.success && !data.waiting) {
        setWinner(null);
        setTie(false);
        setPlayAgainRequested(false);
        setWaitingForOpponent(false);
        setMoveTimer(MOVE_TIME_LIMIT);
        setGameTimer(GAME_TIME_LIMIT);
        setMoveTimerActive(true);
        setGameTimerActive(true);
        setTurnSkipped(false);
        setTurnSkippedMessage("");
      } else if (data.success && data.waiting) {
        setWaitingForOpponent(true);
      } else {
        setPlayAgainError(data.message || "Unknown error");
      }
    } catch (err) {
      setPlayAgainError("Network or server error. Please try again.");
    }
  };

  // UI
    return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Tic Tac Toe <span className={styles.multiplayerLabel}>(Multiplayer)</span></h1>

      {/* LOBBY: Only show if no game is active */}
      {!gameNumber && (
        <div className={styles.lobby}>
          <button type="button" className={styles.createBtn} onClick={handleCreateGame} disabled={loading}>Create Game</button>
          <div className={styles.or}>or</div>
          <input
            className={styles.joinInput}
            type="text"
            placeholder="Enter game code"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            aria-label="Enter game code to join"
          />
          <button type="button" className={styles.joinBtn} onClick={handleJoinGame} disabled={loading || !joinCode}>Join Game</button>
        </div>
      )}

      {showGameCode && (
        <div className={styles.gameCodeBox}>
          <span className={styles.gameCodeLabel}>Game Code:</span>
          <span className={styles.gameCode}>{gameNumber}</span>
          <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy game code">Copy</button>
          {copyStatus && <span className={styles.copyStatus}>{copyStatus}</span>}
        </div>
      )}

      {mySymbol && (
        <div className={styles.playerRole}>
          You are <b>{mySymbol}</b>
        </div>
      )}

      {/* WAITING: Show if game started but both players not joined */}
      {gameNumber && !bothPlayersJoined && (
        <output className={styles.statusBar} role="status" aria-live="polite">Waiting for opponent to join...</output>
      )}

      {/* GAME: Show if both players joined */}
      {gameNumber && bothPlayersJoined && (
        <>
          <div className={styles.timers}>
            <div className={styles.timerBox}>
              <span className={styles.timerLabel}>Move Timer:</span>
              <span className={styles.timerValue}>{pad(Math.floor(moveTimer / 60))}:{pad(moveTimer % 60)}</span>
                                </div>
            <div className={styles.timerBox}>
              <span className={styles.timerLabel}>Game Timer:</span>
              <span className={styles.timerValue}>{pad(Math.floor(gameTimer / 60))}:{pad(gameTimer % 60)}</span>
            </div>
          </div>
          <div className={styles.board} role="grid" aria-label="Tic Tac Toe board">
            {board.map((cell, idx) => (
              <button
                key={idx}
                className={styles.cell}
                onClick={() => handleClick(idx)}
                disabled={!!cell || !gameActive || winner || tie || turnSkipped || (isXNext && mySymbol !== "X") || (!isXNext && mySymbol !== "O") || !bothPlayersJoined || loading}
                aria-label={`Cell ${idx + 1} ${cell ? cell : "empty"}`}
                role="gridcell"
                type="button"
              >
                        {cell}
                    </button>
                ))}
            </div>
          <div className={styles.infoBar}>
            {winner && <span className={styles.winMsg}>{winner === mySymbol ? "You win!" : "You lose!"}</span>}
            {tie && <span className={styles.tieMsg}>It&apos;s a tie!</span>}
            {turnSkipped && <span className={styles.turnSkippedMsg}>{turnSkippedMessage}</span>}
            {!winner && !tie && !turnSkipped && (
              isXNext === (mySymbol === "X")
                ? <span className={styles.turnMsg}>Your turn</span>
                : <span className={styles.turnMsg}>Opponent&apos;s turn</span>
            )}
          </div>
          {(winner || tie) && !playAgainRequested && (
            <button type="button" className={styles.playAgainBtn} onClick={handlePlayAgain} disabled={loading}>
              Play Again
            </button>
          )}
          {waitingForOpponent && (
            <div className={styles.statusBar} style={{ color: '#d97706' }}>
              Waiting for opponent to play again...
            </div>
          )}
          {playAgainError && <p style={{ color: 'red' }}>{playAgainError}</p>}
        </>
      )}

      {/* INFO: Always show at the bottom */}
      <div className={styles.workingContainer}>
        <div>
          <h2>How Does Multiplayer Work on Vercel?</h2>
          <p>
            Multiplayer Tic Tac Toe lets you play with a friend online. One player creates a game and shares the code; the other joins using that code. The game starts when both players are present.
          </p>
        </div>
        <div>
          <h3>How Real-Time Sync Works</h3>
          <p>
            For best compatibility with Vercel (which does not support always-on servers), this game uses <strong>HTTP polling</strong> instead of WebSockets. Your browser checks for updates every second, so you’ll see your opponent’s moves with a short delay.
          </p>
        </div>
        <div>
          <h3>Game Rules</h3>
          <ul className={styles.ulContainer}>
            <li>Each player is assigned a unique symbol (“X” or “O”) and takes turns placing it on the board.</li>
            <li>The first to get three in a row (horizontally, vertically, or diagonally) wins.</li>
            <li>If all cells are filled and no one has three in a row, the game is a draw.</li>
            <li>There is a time limit for each move and for the whole game. If you run out of time, your turn is skipped or the game ends in a draw.</li>
          </ul>
        </div>
        <div>
          <h3>How to Start</h3>
          <ul className={styles.ulContainer}>
            <li>Click <strong>Create Game</strong> to get a game code and wait for your friend to join.</li>
            <li>Or, enter a code to join a friend’s game.</li>
            <li>The game begins when both players are connected.</li>
          </ul>
        </div>
        <div>
          <h3>Play Again System</h3>
          <ul className={styles.ulContainer}>
            <li>After a game ends, both players must click “Play Again” to start a new round.</li>
            <li>If only one player clicks, they see “Waiting for opponent to play again...”</li>
            <li>The board resets only when both agree, preventing unwanted resets.</li>
          </ul>
        </div>
        <div>
          <h3>Technical Notes</h3>
          <ul className={styles.ulContainer}>
            <li>Game state is stored in-memory and may reset if the server restarts (for demo purposes).</li>
            <li>For a true real-time experience, consider using an external server or managed real-time service.</li>
          </ul>
        </div>
        <div className={styles.youtubeLinkContainer}>
          <a className={styles.youtubeLink} href="https://youtu.be/STjW3eH0Cik?feature=shared" target="_blank" rel="noopener noreferrer">
            Learn more about Tic Tac Toe strategy
          </a>
        </div>
      </div>
    </div>
  );
} 