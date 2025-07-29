import { useState } from "react";
import { getBestMove } from "./HardMinimax"; // Import the getBestMove function from the HardMinimax module to get the best move for the AI
import styles from "./gameBoard.module.css";
import Link from "next/link";

type GameBoardProps = { // Define the type for the props that the GameBoard component will receive
    playerSymbol: "X" | "O"; // The symbol used by the player ("X" or "O")
};

const initialBoard = Array(9).fill(null); // Define the initial state of the board with 9 null values representing an empty board

export default function GameBoard({ playerSymbol }: GameBoardProps) {
    const [board, setBoard] = useState<(null | "X" | "O")[]>(initialBoard); // State to keep track of the current board state
    const [currentTurn, setCurrentTurn] = useState<"X" | "O">(playerSymbol); // State to keep track of whose turn it is ("X" or "O")
    const [gameStatus, setGameStatus] = useState<string>("Start playing your game"); // State to display the game status (e.g., instructions or result)
    const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false); // State to show when computer is thinking
    const computerSymbol = playerSymbol === "X" ? "O" : "X"; // Determine the computer's symbol based on the player's symbol

    // Function to check if there is a winner on the board
    const checkWin = (board: (null | "X" | "O")[]) => {
        // Define the winning patterns for rows, columns, and diagonals
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];

        // Check each winning pattern
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;

            // If all three cells in the pattern are the same and not null, return the symbol
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null; // No winner yet
    };

    // Function to check if the game is a draw (i.e., all cells are filled)
    const isDraw = (board: (null | "X" | "O")[]) => {
        return board.every((cell) => cell !== null);
    };

    // Function to handle a click on a board cell
    const handleClick = (index: number) => {
        // Do nothing if the cell is already filled, it's the computer's turn, or the game is already won
        if (board[index] || currentTurn === computerSymbol || checkWin(board) || isComputerThinking) return;

        // Create a copy of the board and update the clicked cell with the player's symbol
        const updatedBoard = board.slice();
        updatedBoard[index] = currentTurn;
        setBoard(updatedBoard); // Update the board state

        // Update the game status to indicate the computer's turn
        setGameStatus("Wait... Now it's the Computer's turn");
        setIsComputerThinking(true);

        // Switch to the computer's turn
        setCurrentTurn(computerSymbol);

        // Use a timeout to simulate the computer's thinking time
        setTimeout(() => {
            // If the game is not yet won or drawn, let the computer make a move
            if (!checkWin(updatedBoard) && !isDraw(updatedBoard)) {
                try {
                    // Get the best move for the computer
                    const computerMove = getBestMove(updatedBoard, computerSymbol);
                    updatedBoard[computerMove] = computerSymbol; // Update the board with the computer's move
                    setBoard(updatedBoard); // Update the board state
                    setGameStatus("It's Your Turn"); // Update the game status
                } catch (error) {
                    // Handle AI errors gracefully
                    console.error('AI Error:', error);
                    setGameStatus("Computer encountered an error. Please try again.");
                    
                    // Find any available move as fallback
                    const availableMoves = updatedBoard
                        .map((cell, index) => cell === null ? index : null)
                        .filter((index): index is number => index !== null);
                    
                    if (availableMoves.length > 0) {
                        const fallbackMove = availableMoves[0];
                        updatedBoard[fallbackMove] = computerSymbol;
                        setBoard(updatedBoard);
                        setGameStatus("It's Your Turn (Fallback move)");
                    }
                }
            }
            // Switch back to the player's turn
            setCurrentTurn(playerSymbol);
            setIsComputerThinking(false);
        }, 1000); // 1-second delay for the computer's move
    };

    // Function to reset the game
    const reset = () => {
        setGameStatus("It's Your Turn"); // Reset the game status
        setBoard(Array(9).fill(null)); // Clear the board
        setCurrentTurn(playerSymbol); // Reset to player's turn
        setIsComputerThinking(false); // Reset computer thinking state
    };

    // Determine if there is a winner or if the game is a draw
    const winner = checkWin(board);
    const draw = isDraw(board);

    return (<>
            <div className={styles.boardContainer}>
                {/* Display the game status */}
                {currentTurn === computerSymbol ? (
                    <h1 className={styles.turnStatus}>
                        {isComputerThinking ? "Computer is thinking..." : gameStatus}
                    </h1>
                ) : (
                    <h1>{gameStatus}</h1>
                )}

                <div className={styles.board}>
                    {/* Render each cell as a button */}
                    {board.map((cell, index) => (
                        <button
                            className={styles.gridButton}
                            key={index}
                            onClick={() => handleClick(index)}
                            disabled={currentTurn === computerSymbol || cell !== null || isComputerThinking} // Disable button if it's the computer's turn or cell is filled
                        >
                            {cell} {/* Display the cell content ("X", "O", or empty) */}
                        </button>
                    ))}
                </div>

                {/* Show reset button and result message if the game is over */}
                {(winner || draw) && (
                    <div className={styles.resetButtonContainer}>
                        {winner &&
                            <h2 className={styles.winMessage}>{winner === computerSymbol ? "You lose the game 😞" : "You win! 🎉"}</h2>}
                        {draw && !winner && <h2 className={styles.winMessage}>It&apos;s a draw!</h2>}

                        {/* Button to reset the game */}
                        <button type="button" className={styles.resetButton} onClick={reset}>
                            Reset
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.workingContainer}>
                <div>
                    <h2>How Does the Computer Pick the Best Move?</h2>
                    <p>The computer looks at the current board state, checks every empty cell, and evaluates what would
                        happen if it places its symbol (X or O) there.</p>
                </div>

                <div>
                    <h3>Minimax Algorithm</h3>
                    <p>The AI uses an algorithm called Minimax, which simulates every possible move. It tries to find
                        the move that will either help it win or force a draw.</p>
                </div>

                <div>
                    <h3>Scoring System</h3>
                    <p>Every time the AI places a symbol, it checks if it would lead to a win, loss, or draw:</p>
                    <ul className={styles.ulContainer}>
                        <li>AI Wins: +10 points</li>
                        <li>Player Wins: -10 points</li>
                        <li>Draw: 0 points</li>
                    </ul>
                </div>

                <div>
                    <h3>Alpha-Beta Pruning</h3>
                    <p>The AI also uses Alpha-Beta Pruning to make the calculations faster by &quot;cutting
                        off&quot; moves that
                        don&apos;t
                        need to be evaluated fully. This reduces the number of possible outcomes the computer has to
                        consider.</p>
                    <br/>
                    <ul className={styles.ulContainer}>
                        <li>Alpha represents the best value the computer can achieve.</li>
                        <li>Beta represents the worst value the player can force the computer into.</li>
                    </ul>
                    <br/>
                    <p>Whenever the computer detects that a move is worse than one already evaluated, it stops considering that branch of the decision tree.</p>
                </div>

                <div>
                    <h3>Error Handling</h3>
                    <p>The AI includes robust error handling to ensure the game continues even if the algorithm encounters unexpected situations:</p>
                    <ul className={styles.ulContainer}>
                        <li>Input validation prevents invalid board states</li>
                        <li>Fallback moves ensure the game never gets stuck</li>
                        <li>Clear error messages help users understand what happened</li>
                        <li>Graceful degradation maintains game functionality</li>
                    </ul>
                </div>

                <div className={styles.youtubeLinkContainer}>
                    <Link className={styles.youtubeLink} href="https://youtu.be/STjW3eH0Cik?feature=shared" target="_blank" rel="noopener noreferrer" >Learn more about it</Link>
                </div>
            </div>
        </>
    );
}
