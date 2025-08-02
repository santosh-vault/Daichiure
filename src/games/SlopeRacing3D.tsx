import React, { useState, useEffect } from "react";
import { useGameCoins } from "../hooks/useGameCoins";

const SlopeRacing3D: React.FC = () => {
  const [gameStartTime] = useState(Date.now());
  const [gameEnded, setGameEnded] = useState(false);

  useGameCoins({
    gameId: "SlopeRacing3D",
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
    <div className="game-container w-full flex justify-center">
      <iframe
        style={{ width: "100%", maxWidth: "900px", height: "600px" }}
        src="https://play.gamepix.com/slope-racing-3d/embed?sid=322U0"
        width="900"
        height="600"
        frameBorder="0"
        scrolling="no"
        title="Slope Racing 3D"
        className="rounded-lg shadow-lg"
      />
    </div>
  );
};

export default SlopeRacing3D;
