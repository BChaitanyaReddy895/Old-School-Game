"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from "./page.module.css";
import TicTacToeImage from "/public/tic-tac-toe.svg";

const TicTacToeSelection = () => {
    return (
        <>
            <div className={styles.bgGrid}>
                <div className={styles.blurGrid}></div>
            </div>
            
            <div className={styles.selectionContainer}>
                <div className={styles.gameHeader}>
                    <div className={styles.gameIcon}>
                        <Image src={TicTacToeImage} alt="Tic Tac Toe" width={80} height={70} />
                    </div>
                    <h1>Tic Tac Toe</h1>
                    <h2 className={styles.modeHeading}>Choose your game mode</h2>
                </div>

                <div className={styles.modeContainer}>
                    <Link href="/game/tic-tac-toe/single-player" className={styles.modeCard} aria-label="Play Tic Tac Toe vs AI" role="button" tabIndex={0}>
                        <div className={styles.modeIcon}>🤖</div>
                        <span className={styles.modeLabel}>Play vs AI</span>
                        <p>Challenge our intelligent AI opponent</p>
                    </Link>
                    <Link href="/game/tic-tac-toe/multi-player" className={styles.modeCard} aria-label="Play Tic Tac Toe Multiplayer" role="button" tabIndex={0}>
                        <div className={styles.modeIcon}>👥</div>
                        <span className={styles.modeLabel}>Multiplayer</span>
                        <p>Play with friends online</p>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TicTacToeSelection; 