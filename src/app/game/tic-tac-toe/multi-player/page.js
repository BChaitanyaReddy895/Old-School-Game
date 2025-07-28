"use client";

import {useState, useEffect, useRef} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styles from "./page.module.css";

// TODO: Implement HTTP polling logic for multiplayer game state
// TODO: Use fetch to poll /api/game-state and POST to /api/move

const Game = () => {


    const [board, setBoard] = useState(Array(9).fill(null)); // Tic Tac Toe board
    const [isXNext, setIsXNext] = useState(true); // Determines if 'X' is the next player
    const [gameNumber, setGameNumber] = useState(''); // Game number for joining games
    const [currentGame, setCurrentGame] = useState(null); // The current game being played
    const [status, setStatus] = useState(''); // Status message to display to the user
    const [mySymbol, setMySymbol] = useState(''); // Player's symbol ('X' or 'O')
    const [hasStarted, setHasStarted] = useState(false); // Flag to check if the game has started

    const [optionSelected, setOptionSelected] = useState(false);
    const [optionNewGame, setOptionNewGame] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gameActive, setGameActive] = useState(false);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);

    const [playerId, setPlayerId] = useState(() =>
      typeof window !== 'undefined' ? localStorage.getItem('ttt_playerId') : ''
    );

    const pollingInterval = 1000; // 1 second
    const pollingRef = useRef(null);

    useEffect(() => {
        let statusTimer;
        if (status) {
            statusTimer = setTimeout(() => {
                setStatus('');
            }, 10000); // 10000 milliseconds = 10 seconds
        }
        return () => {
            clearTimeout(statusTimer); // Clear the timer on cleanup
        };
    }, [status]);

    useEffect(() => {
        // REMOVE: All socket.on and socket.emit logic in useEffect and handlers
        // TODO: Implement HTTP polling logic for multiplayer game state
        // TODO: Use fetch to poll /api/game-state and POST to /api/move

        return () => {
            // REMOVE: All socket.off('move');
            // REMOVE: All socket.off('gameCreated');
            // REMOVE: All socket.off('gameJoined');
            // REMOVE: All socket.off('userJoined');
            // REMOVE: All socket.off('resetGame');
            // REMOVE: All socket.off('error');
        };
    }, []);

    useEffect(() => {
        if (!currentGame || !gameStarted || !gameActive || !playerId) return;
        let isMounted = true;
        async function pollGameState() {
            try {
                const res = await fetch(`/api/game-state?gameNumber=${currentGame}&playerId=${playerId}`);
                if (!res.ok) throw new Error('Failed to fetch game state');
                const data = await res.json();
                if (!isMounted) return;
                setBoard(data.board);
                setIsXNext(data.isXNext);
                setHasStarted(data.hasStarted);
                setMySymbol(data.symbol || mySymbol);
                setGameActive(!data.winner && !data.tie);
            } catch (err) {
                setStatus('Polling error: ' + err.message);
            }
        }
        pollingRef.current = setInterval(pollGameState, pollingInterval);
        return () => {
            isMounted = false;
            clearInterval(pollingRef.current);
        };
    }, [currentGame, gameStarted, gameActive, playerId]);

    const handleClick = async (index) => {
        if (!currentGame) {
            setStatus('Create or join a game first!');
            return;
        }
        if (!hasStarted) {
            setStatus('Please wait for opponent to join');
            return;
        }
        if (board[index] || calculateWinner(board)) return;

        if (isXNext && mySymbol !== 'X') {
            setStatus('Please wait for opponent\'s move');
            return;
        }

        if (isXNext === false && mySymbol === 'X') {
            setStatus('Please wait for opponent\'s move');
            return;
        }

        const symbol = isXNext ? 'X' : 'O';

        // Optimistic UI update
        setBoard(prev => {
            const newBoard = [...prev];
            newBoard[index] = symbol;
            return newBoard;
        });
        setIsXNext(!isXNext);
        setGameActive(false); // Pause polling until move is confirmed
        try {
            setLoading(true);
            const res = await fetch('/api/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameNumber: currentGame, index, symbol })
            });
            if (!res.ok) throw new Error('Move failed');
            setGameActive(true); // Resume polling
        } catch (err) {
            setStatus('Move error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    const reset = async (isUserInitiated = true) => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameActive(true);
        setWaitingForOpponent(false);
        if (isUserInitiated) {
            try {
                setLoading(true);
                const res = await fetch('/api/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameNumber: currentGame, playerId })
                });
                const data = await res.json();
                if (data.status === 'waiting') {
                    setWaitingForOpponent(true);
                    setStatus('Waiting for opponent to play again...');
                } else if (data.status === 'reset') {
                    setWaitingForOpponent(false);
                    setStatus('Game reset!');
                }
            } catch (err) {
                setStatus('Reset error: ' + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/create-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Create game failed');
            const data = await res.json();
            setCurrentGame(data.gameNumber);
            setPlayerId(data.playerId);
            localStorage.setItem('ttt_playerId', data.playerId);
            setMySymbol(data.symbol);
            setStatus(`Game created. Your game number is ${data.gameNumber}`);
            setGameStarted(true);
            setGameActive(true);
        } catch (err) {
            setStatus('Create game error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async () => {
        if (!gameNumber) return;
        setLoading(true);
        try {
            const res = await fetch('/api/join-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameNumber })
            });
            if (!res.ok) throw new Error('Join game failed');
            const data = await res.json();
            setCurrentGame(gameNumber);
            setPlayerId(data.playerId);
            localStorage.setItem('ttt_playerId', data.playerId);
            setMySymbol(data.symbol);
            setStatus(`Joined game ${gameNumber}`);
            setGameStarted(true);
            setGameActive(true);
        } catch (err) {
            setStatus('Join game error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const winner = calculateWinner(board);
    const isBoardFull = board.every(cell => cell !== null);
    const gameStatus = winner ? `${winner} is winner 🎉` : isBoardFull ? 'Match Tie 🙁' : `You are ${mySymbol} `;


    return (
        <>

            {/*<div id={styles.bgGrid}>*/}
            {/*    <div id={styles.blurGrid}></div>*/}
            {/*</div>*/}


            {!gameStarted && (
                <div className={styles.urlContainer}>{
                    optionSelected ? (
                        optionNewGame ? (
                            <div>
                                <div className={styles.urlWrapper}>
                                    <p className={styles.urlText}>{currentGame === null ? 'Refresh the Page' : currentGame}</p>
                                    <CopyToClipboard text={currentGame} onCopy={() => setStatus('Game number copied!')}>
                                        <button className={styles.copyButton}>Copy Code</button>
                                    </CopyToClipboard>
                                </div>
                                <p className={styles.shareText}>{status}</p>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.urlWrapper}>
                                    <input className={styles.urlText} placeholder={'Enter the Code'} type="text"
                                           value={gameNumber}
                                           onChange={(e) => setGameNumber(e.target.value)}/>
                                    <button className={styles.copyButton} onClick={() => {
                                        handleJoinGame();
                                        setGameStarted(true);
                                    }}>Join Game
                                    </button>
                                </div>
                                <p className={styles.shareText}>{status}</p>
                            </div>
                        )
                    ) : (
                        <div>
                            <div className={styles.urlWrapperButton}>
                                <button className={styles.copyButton} onClick={() => {
                                    handleCreateGame();
                                    setOptionNewGame(true);
                                    setOptionSelected(true);
                                }} disabled={loading}>Create Game</button>
                                <button className={styles.copyButton} onClick={() => setOptionSelected(true)} disabled={loading}>Join Game</button>
                            </div>
                            <p className={styles.shareText}>Game On! Create New or Join Existing</p>
                        </div>
                    )}
                </div>)}


            {
                (currentGame && gameStatus) &&
                <div className={styles.gameStatusContainer}>
                    <p>{gameStatus}</p>
                    <p>Current Turn: {isXNext ? 'X' : 'O'}</p>

                </div>
            }



            <div>
                <p className={styles.statusError}>{status}</p>
            </div>

            <div className={styles.gridContainer}>
                {board.map((cell, index) => (
                    <button key={index} className={styles.gridButton} onClick={() => handleClick(index)}>
                        {cell}
                    </button>
                ))}
            </div>

            {(winner || isBoardFull) && (
  <div style={{ marginTop: 20 }}>
    <button
      className={styles.copyButton}
      onClick={() => reset(true)}
      disabled={loading || waitingForOpponent}
    >
      {waitingForOpponent ? 'Waiting for opponent...' : 'Play Again'}
    </button>
  </div>
)}


            {/* Show reset button and result message if the game is over */}
            {(gameStatus.includes("winner") || gameStatus.includes('Tie')) && (
                <div className={styles.resetButtonContainer}>
                    {gameStatus.includes('Tie') ? (
                        <h2 className={styles.winMessage}>It&apos;s a draw!</h2>
                    ) : (
                        <h2 className={styles.winMessage}>
                            {winner === mySymbol ? "You win! 🎉" : "You lose the game 😞"}
                        </h2>
                    )}
                    {/* Button to reset the game */}
                    <button type="button" className={styles.resetButton} onClick={() => reset(true)}>Reset</button>
                </div>
            )}



        </>
    );
};

const calculateWinner = (board) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

export default Game;
