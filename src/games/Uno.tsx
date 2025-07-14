import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAwardGameCoins } from './coinAwarder';

interface Card {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'black';
  value: string;
  isSpecial: boolean;
}

interface Player {
  id: number;
  name: string;
  cards: Card[];
  isAI: boolean;
}

type GameState = 'waiting' | 'playing' | 'gameOver';

const Uno: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [direction, setDirection] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showWildColorPicker, setShowWildColorPicker] = useState(false);

  // Create UNO deck
  const createDeck = useCallback((): Card[] => {
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const specials = ['skip', 'reverse', 'draw2'];
    const wilds = ['wild', 'wild4'];

    const deck: Card[] = [];

    // Add number cards (0-9)
    colors.forEach(color => {
      numbers.forEach(number => {
        const count = number === '0' ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push({
            id: `${color}-${number}-${i}`,
            color,
            value: number,
            isSpecial: false
          });
        }
      });
    });

    // Add special cards (skip, reverse, draw2)
    colors.forEach(color => {
      specials.forEach(special => {
        for (let i = 0; i < 2; i++) {
          deck.push({
            id: `${color}-${special}-${i}`,
            color,
            value: special,
            isSpecial: true
          });
        }
      });
    });

    // Add wild cards
    wilds.forEach(wild => {
      for (let i = 0; i < 4; i++) {
        deck.push({
          id: `black-${wild}-${i}`,
          color: 'black',
          value: wild,
          isSpecial: true
        });
      }
    });

    return deck;
  }, []);

  // Shuffle deck
  const shuffleDeck = useCallback((cards: Card[]): Card[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Deal cards
  const dealCards = useCallback((deck: Card[], numPlayers: number): { players: Player[], remainingDeck: Card[] } => {
    const shuffledDeck = shuffleDeck(deck);
    const players: Player[] = [];
    
    for (let i = 0; i < numPlayers; i++) {
      const playerCards = shuffledDeck.splice(0, 7);
      players.push({
        id: i,
        name: i === 0 ? 'You' : `AI ${i}`,
        cards: playerCards,
        isAI: i !== 0
      });
    }

    return { players, remainingDeck: shuffledDeck };
  }, [shuffleDeck]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const deck = createDeck();
    const { players: newPlayers, remainingDeck } = dealCards(deck, 4);
    
    // Start with a non-special card
    let startCard: Card;
    do {
      startCard = remainingDeck.pop()!;
    } while (startCard.isSpecial);

    setPlayers(newPlayers);
    setDeck(remainingDeck);
    setDiscardPile([startCard]);
    setCurrentPlayer(0);
    setDirection(1);
    setGameState('playing');
    setMessage('Your turn!');
  }, [createDeck, dealCards]);

  // Check if card can be played
  const canPlayCard = useCallback((card: Card, topCard: Card): boolean => {
    if (card.color === 'black') return true;
    return card.color === topCard.color || card.value === topCard.value;
  }, []);

  // Get playable cards for a player
  const getPlayableCards = useCallback((playerCards: Card[], topCard: Card): Card[] => {
    return playerCards.filter(card => canPlayCard(card, topCard));
  }, [canPlayCard]);

  // Draw card
  const drawCard = useCallback((playerId: number) => {
    if (deck.length === 0) {
      const topCard = discardPile[discardPile.length - 1];
      const reshuffled = shuffleDeck(discardPile.slice(0, -1));
      setDeck(reshuffled);
      setDiscardPile([topCard]);
    }

    const drawnCard = deck[deck.length - 1];
    setDeck(prev => prev.slice(0, -1));
    
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, cards: [...player.cards, drawnCard] }
        : player
    ));
  }, [deck, discardPile, shuffleDeck]);

  // Play card
  const playCard = useCallback((playerId: number, card: Card, wildColor?: 'red' | 'blue' | 'green' | 'yellow') => {
    const topCard = discardPile[discardPile.length - 1];
    
    if (!canPlayCard(card, topCard)) {
      setMessage('Invalid card!');
      return false;
    }

    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, cards: player.cards.filter(c => c.id !== card.id) }
        : player
    ));

    const cardToPlay = wildColor && card.color === 'black' 
      ? { ...card, color: wildColor }
      : card;
    setDiscardPile(prev => [...prev, cardToPlay]);

    const updatedPlayers = players.map(player => 
      player.id === playerId 
        ? { ...player, cards: player.cards.filter(c => c.id !== card.id) }
        : player
    );

    if (updatedPlayers[playerId].cards.length === 0) {
      setGameState('gameOver');
      setMessage(`${updatedPlayers[playerId].name} wins!`);
      return true;
    }

    let nextPlayer = currentPlayer;
    let newDirection = direction;

    switch (cardToPlay.value) {
      case 'skip':
        nextPlayer = (currentPlayer + direction * 2 + 4) % 4;
        setMessage('Turn skipped!');
        break;
      case 'reverse':
        newDirection = -direction;
        setDirection(-direction);
        setMessage('Direction reversed!');
        break;
      case 'draw2':
        const targetPlayer = (currentPlayer + direction + 4) % 4;
        drawCard(targetPlayer);
        drawCard(targetPlayer);
        nextPlayer = (currentPlayer + direction * 2 + 4) % 4;
        setMessage(`${updatedPlayers[targetPlayer].name} draws 2 cards!`);
        break;
      case 'wild4':
        const targetPlayer2 = (currentPlayer + direction + 4) % 4;
        drawCard(targetPlayer2);
        drawCard(targetPlayer2);
        drawCard(targetPlayer2);
        drawCard(targetPlayer2);
        nextPlayer = (currentPlayer + direction * 2 + 4) % 4;
        setMessage(`${updatedPlayers[targetPlayer2].name} draws 4 cards!`);
        break;
      default:
        nextPlayer = (currentPlayer + direction + 4) % 4;
        setMessage(`${updatedPlayers[nextPlayer].name}'s turn`);
    }

    setCurrentPlayer(nextPlayer);
    return true;
  }, [currentPlayer, direction, players, discardPile, canPlayCard, drawCard]);

  // AI turn
  const playAITurn = useCallback(() => {
    if (currentPlayer === 0 || gameState !== 'playing') return;

    const aiPlayer = players[currentPlayer];
    const topCard = discardPile[discardPile.length - 1];
    const playableCards = getPlayableCards(aiPlayer.cards, topCard);

    setTimeout(() => {
      if (playableCards.length > 0) {
        const cardToPlay = playableCards[0];
        let wildColor: 'red' | 'blue' | 'green' | 'yellow' | undefined;
        
        if (cardToPlay.color === 'black') {
          const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
          wildColor = colors[Math.floor(Math.random() * colors.length)];
        }

        playCard(currentPlayer, cardToPlay, wildColor);
      } else {
        drawCard(currentPlayer);
        setCurrentPlayer((currentPlayer + direction + 4) % 4);
        setMessage(`${players[(currentPlayer + direction + 4) % 4].name}'s turn`);
      }
    }, 1500);
  }, [currentPlayer, players, discardPile, getPlayableCards, playCard, drawCard, direction, gameState]);

  // Handle player card selection
  const handleCardClick = useCallback((card: Card) => {
    if (currentPlayer !== 0 || gameState !== 'playing') return;

    const topCard = discardPile[discardPile.length - 1];
    
    if (card.color === 'black') {
      setSelectedCard(card);
      setShowWildColorPicker(true);
    } else if (canPlayCard(card, topCard)) {
      playCard(0, card);
    } else {
      setMessage('Invalid card!');
    }
  }, [currentPlayer, gameState, discardPile, canPlayCard, playCard]);

  // Handle wild color selection
  const handleWildColorSelect = useCallback((color: 'red' | 'blue' | 'green' | 'yellow') => {
    if (selectedCard) {
      playCard(0, selectedCard, color);
      setSelectedCard(null);
      setShowWildColorPicker(false);
    }
  }, [selectedCard, playCard]);

  // Handle draw card
  const handleDrawCard = useCallback(() => {
    if (currentPlayer !== 0 || gameState !== 'playing') return;
    
    drawCard(0);
    setCurrentPlayer((currentPlayer + direction + 4) % 4);
    setMessage(`${players[(currentPlayer + direction + 4) % 4].name}'s turn`);
  }, [currentPlayer, gameState, drawCard, direction, players]);

  // AI turn effect
  useEffect(() => {
    if (currentPlayer !== 0 && gameState === 'playing') {
      playAITurn();
    }
  }, [currentPlayer, gameState, playAITurn]);

  useAwardGameCoins(gameState === 'gameOver');

  // Enhanced card component
  const CardComponent = ({ card, onClick, isPlayable = false, isSelected = false, isSmall = false }: {
    card: Card;
    onClick?: () => void;
    isPlayable?: boolean;
    isSelected?: boolean;
    isSmall?: boolean;
  }) => {
    const getCardColor = () => {
      switch (card.color) {
        case 'red': return 'bg-gradient-to-br from-red-500 to-red-600';
        case 'blue': return 'bg-gradient-to-br from-blue-500 to-blue-600';
        case 'green': return 'bg-gradient-to-br from-green-500 to-green-600';
        case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
        case 'black': return 'bg-gradient-to-br from-gray-800 to-gray-900';
        default: return 'bg-gray-500';
      }
    };

    const getCardText = () => {
      if (card.value === 'skip') return '⏭️';
      if (card.value === 'reverse') return '🔄';
      if (card.value === 'draw2') return '+2';
      if (card.value === 'wild') return '🌈';
      if (card.value === 'wild4') return '+4';
      return card.value;
    };

    const size = isSmall ? 'w-12 h-16' : 'w-20 h-28';
    const textSize = isSmall ? 'text-xs' : 'text-lg';

    return (
      <div
        className={`${size} ${getCardColor()} rounded-lg border-2 shadow-lg cursor-pointer transition-all duration-200 ${
          isPlayable ? 'border-yellow-400 shadow-yellow-400/50' : 'border-white/20'
        } ${
          isSelected ? 'scale-110 shadow-xl' : 'hover:scale-105'
        } ${onClick ? 'hover:shadow-xl' : ''}`}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center h-full text-white font-bold">
          <div className={`${textSize} font-extrabold`}>{getCardText()}</div>
          {card.color !== 'black' && (
            <div className={`w-2 h-2 rounded-full mt-1 ${
              card.color === 'red' ? 'bg-red-200' :
              card.color === 'blue' ? 'bg-blue-200' :
              card.color === 'green' ? 'bg-green-200' :
              'bg-yellow-200'
            }`} />
          )}
        </div>
      </div>
    );
  };

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-6">🎴</div>
          <h1 className="text-4xl font-bold text-white mb-4">UNO 2D</h1>
          <p className="text-white/90 mb-8 text-lg">
            The classic card game with a modern twist! Match colors and numbers, use special cards, and be the first to get rid of all your cards.
          </p>
          <button
            onClick={() => {
              setGameStarted(true);
              initializeGame();
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">UNO 2D</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-full px-6 py-2 inline-block">
            <span className="text-white font-semibold">{message}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6">
          {/* AI Players */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {players.slice(1).map((player, index) => (
              <div key={player.id} className={`text-center p-4 rounded-2xl transition-all duration-300 ${
                currentPlayer === player.id 
                  ? 'bg-yellow-400/20 border-2 border-yellow-400' 
                  : 'bg-white/10'
              }`}>
                <div className="text-white font-bold mb-2">{player.name}</div>
                <div className="flex justify-center gap-1">
                  {player.cards.map((_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="w-8 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded border border-white/20"
                    />
                  ))}
                </div>
                {player.cards.length <= 2 && (
                  <div className="text-red-400 font-bold text-sm mt-2 animate-pulse">UNO!</div>
                )}
              </div>
            ))}
          </div>

          {/* Center Area */}
          <div className="flex justify-center items-center gap-8 mb-8">
            {/* Deck */}
            <div className="text-center">
              <div className="text-white font-semibold mb-2">Deck</div>
              <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg border-2 border-white/20 shadow-lg">
                <div className="flex items-center justify-center h-full text-white font-bold">
                  {deck.length}
                </div>
              </div>
            </div>

            {/* Discard Pile */}
            <div className="text-center">
              <div className="text-white font-semibold mb-2">Discard Pile</div>
              {discardPile.length > 0 && (
                <CardComponent card={discardPile[discardPile.length - 1]} />
              )}
            </div>
          </div>

          {/* Player's Hand */}
          <div className="text-center">
            <div className="text-white font-bold text-xl mb-4">Your Cards</div>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {players[0]?.cards.map(card => {
                const topCard = discardPile[discardPile.length - 1];
                const isPlayable = canPlayCard(card, topCard);
                return (
                  <CardComponent
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(card)}
                    isPlayable={isPlayable}
                  />
                );
              })}
            </div>
            
            {/* Action Button */}
            <button
              onClick={handleDrawCard}
              disabled={currentPlayer !== 0 || gameState !== 'playing'}
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Draw Card
            </button>
          </div>
        </div>

        {/* Wild Color Picker */}
        {showWildColorPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-6">Choose a Color</h3>
              <div className="grid grid-cols-2 gap-4">
                {(['red', 'blue', 'green', 'yellow'] as const).map(color => (
                  <button
                    key={color}
                    onClick={() => handleWildColorSelect(color)}
                    className={`w-20 h-20 rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-all duration-200 ${
                      color === 'red' ? 'bg-red-500' :
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'green' ? 'bg-green-500' :
                      'bg-yellow-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-6">{message}</p>
              <button
                onClick={() => {
                  setGameState('waiting');
                  initializeGame();
                }}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-white/90 mt-8">
        <p className="text-lg font-semibold mb-2">How to Play:</p>
        <p className="text-sm">Match cards by color or number. Use special cards to skip turns, reverse direction, or make opponents draw cards.</p>
        <p className="text-sm">Be the first to get rid of all your cards to win!</p>
      </div>
    </div>
  );
};

export default Uno; 