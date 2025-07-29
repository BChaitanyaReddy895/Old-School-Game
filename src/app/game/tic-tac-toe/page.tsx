"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from "./page.module.css";
import TicTacToeImage from "/public/tic-tac-toe.svg";

const TicTacToeSelection = () => {
    return (
        <>
            <div id={styles.bgGrid}>
                <div id={styles.blurGrid}></div>
            </div>
            
            <div className={styles.selectionContainer}>
                <div className={styles.gameHeader}>
                    <div className={styles.gameIcon}>
                        <Image src={TicTacToeImage} alt="Tic Tac Toe" width={80} height={70} />
                    </div>
                    <h1>Tic Tac Toe</h1>
                    <p>Choose your game mode</p>
                </div>

                <div className={styles.modeContainer}>
                    <Link href="/game/tic-tac-toe/single-player" className={styles.modeCard}>
                        <div className={styles.modeIcon}>🤖</div>
                        <h3>Play vs AI</h3>
                        <p>Challenge our intelligent AI opponent</p>
                    </Link>
                    
                    <Link href="/multiplayer/tic-tac-toe" className={styles.modeCard}>
                        <div className={styles.modeIcon}>👥</div>
                        <h3>Multiplayer</h3>
                        <p>Play with friends online</p>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TicTacToeSelection; 