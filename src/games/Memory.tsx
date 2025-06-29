import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, Clock, Star } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_VALUES = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎨', '🎭'];

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const initializeGame = useCallback(() => {
    const shuffledValues = [...CARD_VALUES].sort(() => Math.random() - 0.5);
    const newCards: Card[] = shuffledValues.map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setCards(prev => prev.map(card => 
          card.id === firstId || card.id === secondId 
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }

    // Flip the clicked card
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, isFlipped: true }
        : card
    ));
  }, [cards, flippedCards, gameStarted]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameWon(true);
      
      // Update best scores
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('memoryBestTime', time.toString());
      }
      if (!bestMoves || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memoryBestMoves', moves.toString());
      }
    }
  }, [cards, time, moves, bestTime, bestMoves]);

  useEffect(() => {
    // Load best scores from localStorage
    const savedBestTime = localStorage.getItem('memoryBestTime');
    const savedBestMoves = localStorage.getItem('memoryBestMoves');
    
    if (savedBestTime) setBestTime(parseInt(savedBestTime));
    if (savedBestMoves) setBestMoves(parseInt(savedBestMoves));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarRating = (moves: number) => {
    if (moves <= 12) return 3;
    if (moves <= 18) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Memory Match</h1>
          
          <div className="flex justify-center space-x-8 text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <span>Time: {formatTime(time)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCw className="h-5 w-5 text-amber-400" />
              <span>Moves: {moves}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span>Rating: {getStarRating(moves)}/3</span>
            </div>
          </div>

          {bestTime && bestMoves && (
            <div className="flex justify-center space-x-8 text-gray-400 text-sm mb-4">
              <div>Best Time: {formatTime(bestTime)}</div>
              <div>Best Moves: {bestMoves}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                ${card.isFlipped || card.isMatched
                  ? 'bg-amber-500 text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }
                ${card.isMatched ? 'opacity-75' : ''}
                flex items-center justify-center text-4xl font-bold
                border-2 ${card.isMatched ? 'border-amber-400' : 'border-gray-600'}
              `}
            >
              {(card.isFlipped || card.isMatched) && card.value}
            </div>
          ))}
        </div>

        {gameWon && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-green-400 mb-4">
              🎉 Congratulations! You Won! 🎉
            </div>
            <div className="text-gray-300 mb-4">
              <div>Time: {formatTime(time)}</div>
              <div>Moves: {moves}</div>
              <div className="flex justify-center items-center space-x-1 mt-2">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < getStarRating(moves) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={initializeGame}
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {!gameWon && (
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              New Game
            </button>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm mt-6">
          <div className="mb-2">
            <strong>How to Play:</strong>
          </div>
          <div className="text-xs">
            Click cards to flip them and find matching pairs. 
            Try to complete the game with the fewest moves and fastest time!
          </div>
        </div>
      </div>
    </div>
  );
}; 