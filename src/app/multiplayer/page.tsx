"use client";

import React from 'react';
import Link from 'next/link';
import styles from "./page.module.css";
import TicTacToeImage from "/public/tic-tac-toe.svg";

const MultiplayerSelection = () => {
    return (
        <>
            <div id={styles.bgGrid}>
                <div id={styles.blurGrid}></div>
            </div>
            
            <div className={styles.selectionContainer}>
                <div className={styles.gameHeader}>
                    <div className={styles.gameIcon}>
                        <img src={TicTacToeImage.src} alt="Tic Tac Toe" width="80" height="70" />
                    </div>
                    <h1>Multiplayer Games</h1>
                    <p>Choose your multiplayer game</p>
                </div>

                <div className={styles.modeContainer}>
                    <Link href="/multiplayer/tic-tac-toe" className={styles.modeCard}>
                        <div className={styles.modeIcon}>👥</div>
                        <h3>Tic Tac Toe</h3>
                        <p>Play with friends online</p>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default MultiplayerSelection; 