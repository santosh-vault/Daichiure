import React, { useState, useEffect } from "react";
import { useGameCoins } from "../hooks/useGameCoins";

const GameMonetize77B5MBMQ: React.FC = () => {
  const [gameStartTime] = useState(Date.now());
  const [gameEnded, setGameEnded] = useState(false);

  useGameCoins({
    gameId: "GameMonetize77B5MBMQ",
    trigger: gameEnded,
    score: Math.floor((Date.now() - gameStartTime) / 1000 / 30) * 10, // 10 coins per 30 seconds
    duration: Date.now() - gameStartTime,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGameEnded((prev) => !prev); // Toggle to trigger coin awards
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 400,
      }}
    >
      <iframe
        src="https://html5.gamemonetize.co/77b5mbmq8ruyo6zqgdx6mu8zlvtab3um/"
        width="800"
        height="480"
        scrolling="no"
        frameBorder="0"
        title="GameMonetize Embedded Game 4"
        style={{
          maxWidth: "100%",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        }}
        allowFullScreen
      />
    </div>
  );
};

export default GameMonetize77B5MBMQ;
