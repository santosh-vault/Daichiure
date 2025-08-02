import React, { useEffect, useRef, useState } from "react";
import { useGameCoins } from "../hooks/useGameCoins";

const NinjaBreakoutGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameStartTime] = useState(Date.now());
  const [gameEnded, setGameEnded] = useState(false);

  useGameCoins({
    gameId: "NinjaBreakoutGame",
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

  useEffect(() => {
    if (containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = "";

      // Create the script element
      const script = document.createElement("script");
      script.src =
        "https://cdn.htmlgames.com/embed.js?game=NinjaBreakout&bgcolor=white";
      script.async = true;

      // Append script to the container
      containerRef.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
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
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "600px",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
          backgroundColor: "white",
          overflow: "hidden",
        }}
        title="Ninja Breakout Game"
      />
    </div>
  );
};

export default NinjaBreakoutGame;
