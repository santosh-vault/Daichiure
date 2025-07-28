import React, { useEffect, useState } from "react";
import { useGameCoins } from "../hooks/useGameCoins";

const GameMonetizeWKOKJ30H: React.FC = () => {
  const [gameStartTime] = useState(Date.now());
  const [playTime, setPlayTime] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  // Update play time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTime(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Award coins based on play time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (playTime > 0 && playTime % 30 === 0) {
        setGameEnded(true);
        // Reset the trigger after a short delay
        setTimeout(() => setGameEnded(false), 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playTime]);

  // Use the game coins hook - awards coins every 30 seconds of play
  useGameCoins({
    gameId: "wkokj30h",
    trigger: gameEnded,
    score: Math.floor(playTime / 30) * 10, // 10 points per 30 seconds
    duration: playTime,
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 400,
      }}
    >
      <div style={{ marginBottom: "10px", color: "#666", fontSize: "14px" }}>
        Play Time: {Math.floor(playTime / 60)}:
        {(playTime % 60).toString().padStart(2, "0")} | Score:{" "}
        {Math.floor(playTime / 30) * 10} points
      </div>
      <iframe
        src="https://html5.gamemonetize.co/wkokj30hsjf5iwczg486ovsv1w8tc6xc/"
        width="960"
        height="540"
        scrolling="none"
        frameBorder="0"
        title="Epic Adventure Game"
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

export default GameMonetizeWKOKJ30H;
