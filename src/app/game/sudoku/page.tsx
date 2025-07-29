"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./page.module.css";
import { generateFullSudoku, removeNumbers } from "@/app/game/sudoku/Sudoku";

export default function Home() {
    const [sudoku, setSudoku] = useState<number[][]>([]);
    const [initialSudoku, setInitialSudoku] = useState<number[][]>([]);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("easy");
    const [message, setMessage] = useState<string>("");
    const [sudokuAns, setSudokuAns] = useState<number[][]>([]);
    const [time, setTime] = useState<number>(0);
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Start the timer when a cell is clicked
    const startTimer = useCallback(() => {
        if (!isTimerActive) {
            setIsTimerActive(true);
            timerRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
    }, [isTimerActive]);

    // Stop the timer when the solution is correct
    const stopTimer = useCallback(() => {
        setIsTimerActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);

    // Format time in mm:ss format
    const formatTime = useCallback((time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, "0");
        const seconds = (time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    }, []);

    const checkSolution = useCallback(() => {


        if (!sudokuAns || sudokuAns.length === 0) {
            console.error("Sudoku solution is not initialized yet!");
            setMessage("Sudoku answer grid is not ready yet. Please generate the puzzle first.");
            return false;
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (sudoku[row][col] === 0 || sudoku[row][col] !== sudokuAns[row][col]) {
                    setMessage(`Invalid solution! There's an error at row ${row + 1}, col ${col + 1}. 🤔`);
                    return false;
                }
            }
        }
        stopTimer(); // Stop the timer if the solution is correct

      
      
        setMessage("Congratulations! Your solution is correct. 🥰");
        return true;
    }, [sudoku, sudokuAns, stopTimer]);

    const generateSudoku = useCallback(() => {
        const fullGrid = generateFullSudoku();
        setSudokuAns(fullGrid.map((row) => [...row]));
        return removeNumbers(fullGrid, difficultyLevel);
    }, [difficultyLevel]);

    useEffect(() => {
        const puzzle = generateSudoku();
        setSudoku(puzzle);
        setInitialSudoku(puzzle.map((row) => [...row]));
        setTime(0); // Reset timer on difficulty change
        stopTimer(); // Stop the timer when a new puzzle is generated
    }, [difficultyLevel, generateSudoku, stopTimer]);

    const handleCellClick = useCallback((row: number, col: number) => {
        if (initialSudoku[row][col] === 0) {
            setSelectedCell([row, col]);
            if (time <= 0) {
                startTimer(); // Start the timer on the first click
            }
        }
    }, [initialSudoku, time, startTimer]);

    const handleNumberSelect = useCallback((number: number) => {
        if (selectedCell) {
            const [row, col] = selectedCell;
            const newSudoku = [...sudoku];
            newSudoku[row][col] = number;
            setSudoku(newSudoku);
        }
    }, [selectedCell, sudoku]);

    const isUnchangeable = useCallback((row: number, col: number) => {
        return initialSudoku[row][col] !== 0;
    }, [initialSudoku]);

    const renderCell = useCallback(
        (row: number, col: number) => {
            const value = sudoku[row][col];
            const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
            const isSameRowOrColumn = selectedCell && (selectedCell[0] === row || selectedCell[1] === col);
            const isInSameGrid =
                selectedCell &&
                Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
                Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);

            return (
                <td
                    key={`${row}-${col}`}
                    className={`${styles.cell} ${isUnchangeable(row, col) ? styles.unchangeable : styles.changeable}`}
                    onClick={() => handleCellClick(row, col)}
                    style={{
                        backgroundColor: isSelected
                            ? "lightblue"
                            : isSameRowOrColumn || isInSameGrid
                                ? "#d0f0d0"
                                : isUnchangeable(row, col)
                                    ? "#f0f0f0"
                                    : "white",
                        border: isInSameGrid ? "1px solid var(--light-green)" : "",
                    }}
                >
                    {value !== 0 ? value : ""}
                </td>
            );
        },
        [sudoku, selectedCell, isUnchangeable, handleCellClick]
    );

    return (
        <>
            <div className={styles.container}>
                <h1>Sudoku</h1>

                <div className={styles.difficultyContainer}>
                    <button onClick={() => setDifficultyLevel("easy")}>Easy</button>
                    <button onClick={() => setDifficultyLevel("medium")}>Medium</button>
                    <button onClick={() => setDifficultyLevel("hard")}>Hard</button>
                </div>

                <div className={styles.timerConatainer}>
                    <p className={`${styles.timer} ${isTimerActive ? styles.blink : ""}`}>
                        {formatTime(time)}
                    </p>
                </div>



                <table className={styles.grid}>
                    <tbody>
                    {sudoku.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className={styles.numberSelect}>
                    {Array.from({length: 9}, (_, i) => i + 1).map((number) => (
                        <button key={number} onClick={() => handleNumberSelect(number)} className={styles.numberButton}>
                            {number}
                        </button>
                    ))}
                </div>

                <div className={styles.checkYourSolutionContainer}>
                    <p>{message}</p>
                    <button onClick={() => checkSolution()}>Check your solution</button>
                </div>

                <div className={styles.rules}>
                    <h3>Sudoku Rules</h3>
                    <p>1. Each row, column, and 3x3 grid must contain the numbers 1-9 without repetition.</p>
                    <p>2. Select a box to fill it with a number.</p>
                    <p>3. Pre-filled numbers cannot be changed.</p>
                </div>
            </div>
        </>
    );
}


