"use client";

import {useState, useEffect, useRef, useCallback} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { calculateWinner } from '../../../utils/gameLogic.js';
import styles from "./page.module.css";

const Game = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameNumber, setGameNumber] = useState('');
    const [currentGame, setCurrentGame] = useState(null);
    const [status, setStatus] = useState('');
    const [mySymbol, setMySymbol] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
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
    const isMountedRef = useRef(true);

    // Clear status after 10 seconds
    useEffect(() => {
        let statusTimer;
        if (status) {
            statusTimer = setTimeout(() => {
                setStatus('');
            }, 10000);
        }
        return () => {
            clearTimeout(statusTimer);
        };
    }, [status]);

    // Set mounted flag and cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        
        return () => {
            isMountedRef.current = false;
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Polling effect with proper dependencies
    const pollGameState = useCallback(async () => {
        if (!currentGame || !gameStarted || !playerId || !gameActive) {
            return;
        }
        
        try {
            const res = await fetch(`/api/multiplayer/game-state?gameNumber=${currentGame}&playerId=${playerId}`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            
            if (isMountedRef.current) {
                setBoard(data.board);
                setIsXNext(data.isXNext);
                setHasStarted(data.hasStarted);
                setMySymbol(data.symbol || mySymbol);
                setGameActive(!data.winner && !data.tie);
            }
            

        } catch (err) {
            if (isMountedRef.current) {
                setStatus('Polling error: ' + err.message);
                // Resume polling after error
                setGameActive(true);
            }
        }
    }, [currentGame, gameStarted, playerId, mySymbol, gameActive]);

    // Start/stop polling based on game state
    useEffect(() => {
        if (!currentGame || !gameStarted || !playerId || !gameActive) {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            return;
        }

        // Start polling immediately
        pollGameState();
        pollingRef.current = setInterval(pollGameState, pollingInterval);
        
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [currentGame, gameStarted, playerId, gameActive, pollGameState]);

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

        // Check if it's player's turn
        const isMyTurn = (isXNext && mySymbol === 'X') || (!isXNext && mySymbol === 'O');
        if (!isMyTurn) {
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
        
        // Pause polling temporarily
        setGameActive(false);
        
        try {
            setLoading(true);
            const res = await fetch('/api/multiplayer/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameNumber: currentGame, index, symbol, playerId: playerId })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Move failed');
            }
            
            const data = await res.json();
            
            // Update with server response
            if (data.gameState) {
                setBoard(data.gameState.board);
                setIsXNext(data.gameState.isXNext);
                setGameActive(!data.gameState.winner && !data.gameState.tie);
            } else {
                setGameActive(true); // Resume polling
            }
            
        } catch (err) {
            setStatus('Move error: ' + err.message);
            // Revert optimistic update on error
            setBoard(prev => {
                const newBoard = [...prev];
                newBoard[index] = null;
                return newBoard;
            });
            setIsXNext(!isXNext);
            setGameActive(true); // Resume polling
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
                const res = await fetch('/api/multiplayer/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameNumber: currentGame, playerId })
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Reset failed');
                }
                
                const data = await res.json();
                if (data.status === 'waiting') {
                    setWaitingForOpponent(true);
                    setStatus('Waiting for opponent to play again...');
                } else if (data.status === 'reset') {
                    setWaitingForOpponent(false);
                    setStatus('Game reset!');
                    
                    // Update with server response
                    if (data.gameState) {
                        setBoard(data.gameState.board);
                        setIsXNext(data.gameState.isXNext);
                    }
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
            const res = await fetch('/api/multiplayer/create-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Create game failed');
            }
            
            const data = await res.json();
            setCurrentGame(data.gameNumber);
            setPlayerId(data.playerId);
            localStorage.setItem('ttt_playerId', data.playerId);
            setMySymbol(data.symbol);
            setStatus(`Game created. Your game number is ${data.gameNumber}`);
            setGameStarted(true);
            setGameActive(true);
            
            // Force immediate polling to get initial state
            setTimeout(() => {
                pollGameState();
            }, 100);
        } catch (err) {
            setStatus('Create game error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async () => {
        if (!gameNumber) {
            setStatus('Please enter a game number');
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch('/api/multiplayer/join-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameNumber })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Join game failed');
            }
            
            const data = await res.json();
            setCurrentGame(gameNumber);
            setPlayerId(data.playerId);
            localStorage.setItem('ttt_playerId', data.playerId);
            setMySymbol(data.symbol);
            setStatus(`Joined game ${gameNumber}`);
            setGameStarted(true);
            setGameActive(true);
            
            // Update with server response
            if (data.gameState) {
                setBoard(data.gameState.board);
                setIsXNext(data.gameState.isXNext);
                setHasStarted(data.gameState.hasStarted);
            }
            
            // Force immediate polling to get updated state
            setTimeout(() => {
                pollGameState();
            }, 100);
        } catch (err) {
            setStatus('Join game error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const winner = calculateWinner(board);
    const isBoardFull = board.every(cell => cell !== null);
    const gameStatus = winner ? `${winner} is winner 🎉` : isBoardFull ? 'Match Tie 🙁' : `You are ${mySymbol}`;

    return (
        <>
            {!gameStarted && (
                <div className={styles.urlContainer}>{
                    optionSelected ? (
                        optionNewGame ? (
                            <div>
                                <div className={styles.urlWrapper}>
                                    <p className={styles.urlText}>{currentGame === null ? 'Refresh the Page' : currentGame}</p>
                                    <CopyToClipboard text={currentGame} onCopy={() => setStatus('Game number copied!')}>
                                        <button type="button" className={styles.copyButton}>Copy Code</button>
                                    </CopyToClipboard>
                                </div>
                                <p className={styles.shareText}>{status}</p>
                            </div>
                        ) : (
                            <div>
                                <div className={styles.urlWrapper}>
                                    <input 
                                        className={styles.urlText} 
                                        placeholder={'Enter the Code'} 
                                        type="text"
                                        value={gameNumber}
                                        onChange={(e) => setGameNumber(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                                    />
                                    <button 
                                        type="button"
                                        className={styles.copyButton} 
                                        onClick={() => {
                                            handleJoinGame();
                                            setGameStarted(true);
                                        }}
                                        disabled={loading}
                                    >
                                        Join Game
                                    </button>
                                </div>
                                <p className={styles.shareText}>{status}</p>
                            </div>
                        )
                    ) : (
                        <div>
                            <div className={styles.urlWrapperButton}>
                                <button 
                                    type="button"
                                    className={styles.copyButton} 
                                    onClick={() => {
                                        handleCreateGame();
                                        setOptionNewGame(true);
                                        setOptionSelected(true);
                                    }} 
                                    disabled={loading}
                                >
                                    Create Game
                                </button>
                                <button 
                                    type="button"
                                    className={styles.copyButton} 
                                    onClick={() => setOptionSelected(true)} 
                                    disabled={loading}
                                >
                                    Join Game
                                </button>
                            </div>
                            <p className={styles.shareText}>Game On! Create New or Join Existing</p>
                        </div>
                    )}
                </div>
            )}

            {(currentGame && gameStatus) &&
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
                    <button 
                        type="button"
                        key={index} 
                        className={styles.gridButton} 
                        onClick={() => handleClick(index)}
                        disabled={loading || !gameActive || !hasStarted}
                    >
                        {cell}
                    </button>
                ))}
            </div>

            {(winner || isBoardFull) && (
                <div style={{ marginTop: 20 }}>
                    <button
                        type="button"
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

            {/* Working Explanation Section */}
            <div className={styles.workingContainer}>
                <div>
                    <h2>How Does Multiplayer Work?</h2>
                    <p>This multiplayer Tic Tac Toe game uses HTTP polling to keep players synchronized in real-time.</p>
                </div>

                <div>
                    <h3>Game Creation & Joining</h3>
                    <p>When you create a game, the server generates a unique game code. Share this code with your friend to join the same game. Both players must be present before the game can start.</p>
                </div>

                <div>
                    <h3>Real-time Synchronization</h3>
                    <p>The game uses HTTP polling to check for updates every second. This means:</p>
                    <ul className={styles.ulContainer}>
                        <li>Your moves are sent to the server immediately</li>
                        <li>The server validates your move and updates the game state</li>
                        <li>Both players see the updated board within 1 second</li>
                        <li>Turn validation prevents cheating</li>
                    </ul>
                </div>

                <div>
                    <h3>Mutual Play Again System</h3>
                    <p>After a game ends, both players must click &quot;Play Again&quot; to start a new round. If only one player clicks, they see &quot;Waiting for opponent to play again...&quot; until both agree.</p>
                </div>

                <div>
                    <h3>Error Handling</h3>
                    <p>The game handles network errors gracefully:</p>
                    <ul className={styles.ulContainer}>
                        <li>If a move fails, it&apos;s automatically reverted</li>
                        <li>Polling resumes after connection errors</li>
                        <li>Clear error messages help you understand what went wrong</li>
                        <li>Game state is preserved during temporary disconnections</li>
                    </ul>
                </div>

                <div>
                    <h3>Technical Details</h3>
                    <p>This implementation uses:</p>
                    <ul className={styles.ulContainer}>
                        <li>Next.js API routes for server-side logic</li>
                        <li>HTTP polling for real-time updates</li>
                        <li>Optimistic UI updates for better responsiveness</li>
                        <li>Proper error handling and recovery</li>
                        <li>Unique game codes and player IDs for security</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Game; 