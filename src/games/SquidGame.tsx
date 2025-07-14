import React, { useState } from 'react';
import { useAwardGameCoins } from './coinAwarder';

const dalgonaShapes = [
  { name: 'Circle', emoji: '⚪' },
  { name: 'Star', emoji: '⭐' },
  { name: 'Umbrella', emoji: '☂️' },
  { name: 'Triangle', emoji: '🔺' },
];

const getRandomShape = () => dalgonaShapes[Math.floor(Math.random() * dalgonaShapes.length)];

const SquidGame: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [progress, setProgress] = useState(0);
  const [light, setLight] = useState<'green' | 'red' | 'fakegreen'>('green');
  const [timer, setTimer] = useState(10);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [playerPos, setPlayerPos] = useState(0); // 0 to 100 for Red Light, Green Light
  const [reactionPenalty, setReactionPenalty] = useState(false);
  const [shape, setShape] = useState(getRandomShape());
  const [crackMeter, setCrackMeter] = useState(0); // 0 to 100 for Dalgona
  const [precision, setPrecision] = useState(Math.random() * 80 + 10); // 10-90% for precision bar
  const [ropePos, setRopePos] = useState(50); // 0 (AI wins) to 100 (player wins)
  const [fatigue, setFatigue] = useState(0); // 0 to 100, higher = weaker
  const [showTransition, setShowTransition] = useState(false);
  // Add state for crack animation
  const [crackAnim, setCrackAnim] = useState(false);
  // Add state to track if loss was due to timer
  const [timedOut, setTimedOut] = useState(false);

  useAwardGameCoins(status === 'won' || status === 'lost');

  // 1. Add a font style for Helvetica and clear instructions for each level
  const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };
  const instructions = [
    'Level 1: Red Light, Green Light - Tap ▶️ only when the light is green to move forward. Reach the finish line to win.',
    'Level 2: Dalgona Candy - Click inside the green zone to carve the candy. Avoid cracking it! Fill the bar before time runs out.',
    'Level 3: Tug of War - Tap 💪 repeatedly to pull the rope to your side before the AI wins.'
  ];

  // Red Light, Green Light logic (harder, more visual)
  React.useEffect(() => {
    if (level === 0 && status === 'playing') {
      setPlayerPos(0);
      setReactionPenalty(false);
      let fakeGreen = false;
      const id = setInterval(() => {
        setLight(l => {
          if (l === 'green') {
            // 20% chance for fake green
            if (Math.random() < 0.2 && !fakeGreen) {
              fakeGreen = true;
              setTimeout(() => setLight('red'), 200 + Math.random() * 200);
              return 'fakegreen';
            }
            fakeGreen = false;
            return 'red';
          } else {
            // green is very short, red is longer
            return 'green';
          }
        });
      }, light === 'green' ? 600 + Math.random() * 300 : 1200 + Math.random() * 800);
      setIntervalId(id);
      return () => clearInterval(id);
    }
    if (intervalId) clearInterval(intervalId);
  }, [level, status]);

  // 2. Dalgona: set precision ONCE per level, not every interval, and keep it away from edges
  React.useEffect(() => {
    if (level === 1 && status === 'playing') {
      setTimer(12 + Math.floor(Math.random() * 4)); // 12-15 seconds
      setShape(getRandomShape());
      setCrackMeter(0);
      setProgress(0);
      // Precision between 10% and 85% (so 5% zone is always visible)
      setPrecision(Math.random() * 75 + 10);
      setTimedOut(false);
      if (intervalId) clearInterval(intervalId);
      const id = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(id);
            setTimedOut(true);
            setStatus('lost');
            return 0;
          }
          return t - 1;
        });
        // Move precision zone slightly (±5%)
        setPrecision(p => {
          let newP = p + (Math.random() * 10 - 5);
          if (newP < 10) newP = 10;
          if (newP > 85) newP = 85;
          return newP;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
    if (intervalId) clearInterval(intervalId);
  }, [level, status]);

  // 3. Ensure all intervals are cleared on win/loss/level change
  React.useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [level, status]);

  // Tug of War logic (easier AI)
  React.useEffect(() => {
    if (level === 2 && status === 'playing') {
      setRopePos(50);
      setProgress(0);
      setFatigue(0);
      if (intervalId) clearInterval(intervalId);
      const id = setInterval(() => {
        setRopePos(p => {
          if (p <= 0) {
            clearInterval(id);
            setStatus('lost');
            return 0;
          }
          if (p >= 100) {
            clearInterval(id);
            setStatus('won');
            return 100;
          }
          // AI pulls less hard now
          return p - (1 + Math.random() * 2 + fatigue * 0.03);
        });
        setFatigue(f => Math.max(0, f - 2)); // fatigue recovers slowly
      }, 200); // slower AI interval
      setIntervalId(id);
      return () => clearInterval(id);
    }
    if (intervalId) clearInterval(intervalId);
  }, [level, status]);

  // Reset progress on level change
  React.useEffect(() => {
    setProgress(0);
    setStatus('playing');
    setLight('green');
    setCrackMeter(0);
    setRopePos(50);
    setPlayerPos(0);
    setReactionPenalty(false);
    setFatigue(0);
    setShowTransition(false);
    setTimedOut(false);
  }, [level]);

  // Red Light, Green Light handler
  const handleRedLightGreenLight = () => {
    if (light === 'red' || light === 'fakegreen') {
      setStatus('lost');
      if (intervalId) clearInterval(intervalId);
    } else {
      // Penalty: if player clicks within 200ms of green, lose
      if (!reactionPenalty) {
        setReactionPenalty(true);
        setTimeout(() => setReactionPenalty(false), 200);
      } else {
        setStatus('lost');
        if (intervalId) clearInterval(intervalId);
        return;
      }
      setPlayerPos(pos => {
        if (pos >= 100) {
          setShowTransition(true);
          setTimeout(() => {
            setStatus('won');
            setShowTransition(false);
          }, 700);
          if (intervalId) clearInterval(intervalId);
          return 100;
        }
        return pos + 6 + Math.random() * 6;
      });
    }
  };

  // Dalgona Candy handler (harder)
  const handleDalgona = (e: React.MouseEvent) => {
    // Only count if click is inside the precision zone
    const bar = e.currentTarget as HTMLDivElement;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = (clickX / rect.width) * 100;
    if (clickPercent >= precision && clickPercent <= precision + 5) { // 5% zone
      setProgress(p => {
        if (p >= 100) {
          setShowTransition(true);
          setTimeout(() => {
            setStatus('won');
            setShowTransition(false);
          }, 700);
          if (intervalId) clearInterval(intervalId);
          return 100;
        }
        return p + 6 + Math.random() * 2; // 6-8 per success
      });
      setCrackMeter(c => Math.max(0, c - 10));
    } else {
      setCrackMeter(c => {
        if (c >= 100) {
          setStatus('lost');
          if (intervalId) clearInterval(intervalId);
          return 100;
        }
        // Trigger crack animation
        setCrackAnim(true);
        setTimeout(() => setCrackAnim(false), 300);
        return c + 20 + Math.random() * 5; // 20-25 per miss
      });
    }
  };

  // Tug of War handler (stronger player)
  const handleTugOfWar = () => {
    setRopePos(p => {
      if (p >= 100) {
        setShowTransition(true);
        setTimeout(() => {
          setStatus('won');
          setShowTransition(false);
        }, 700);
        if (intervalId) clearInterval(intervalId);
        return 100;
      }
      if (p <= 0) {
        setStatus('lost');
        if (intervalId) clearInterval(intervalId);
        return 0;
      }
      setFatigue(f => Math.min(100, f + 8));
      return p + 6 - fatigue * 0.05 + Math.random() * 2;
    });
  };

  const handleNextLevel = () => {
    if (level < 2) {
      setLevel(level + 1);
    } else {
      setStatus('won');
    }
  };

  const handleRestart = () => {
    setLevel(0);
    setStatus('playing');
    setProgress(0);
    setLight('green');
    setTimer(10);
    setCrackMeter(0);
    setRopePos(50);
    setPlayerPos(0);
    setReactionPenalty(false);
    setFatigue(0);
    setShowTransition(false);
    setTimedOut(false);
  };

  // Visual feedback for win/loss/transition
  if (status === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center" style={fontStyle}>
        <div className="flex flex-col items-center">
          <span className="text-8xl mb-6">❌</span>
          {timedOut && level === 1 && (
            <div className="mb-2 text-2xl text-red-400 font-bold animate-pulse">Time’s Up!</div>
          )}
          <div className="mb-4 text-xl text-white text-center max-w-lg">{instructions[level]}</div>
          <button onClick={handleRestart} className="bg-amber-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-amber-600 transition-colors">Restart</button>
        </div>
      </div>
    );
  }
  if (status === 'won' && level === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center" style={fontStyle}>
        <div className="flex flex-col items-center">
          <span className="text-8xl mb-6">✅</span>
          <div className="mb-4 text-xl text-white text-center max-w-lg">Congratulations! You completed all levels.</div>
          <button onClick={handleRestart} className="bg-amber-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-amber-600 transition-colors">Play Again</button>
        </div>
      </div>
    );
  }
  if (status === 'won' && level < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center" style={fontStyle}>
        <div className="flex flex-col items-center">
          <span className="text-8xl mb-6">✅</span>
          <div className="mb-4 text-xl text-white text-center max-w-lg">{instructions[level + 1]}</div>
          <button onClick={handleNextLevel} className="bg-amber-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-amber-600 transition-colors">Next</button>
        </div>
      </div>
    );
  }
  if (showTransition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center" style={fontStyle}>
        <span className="text-8xl animate-bounce">🎉</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center py-8 px-2" style={fontStyle}>
      <div className="mb-6 text-xl text-white text-center max-w-lg">{instructions[level]}</div>
      {/* Red Light, Green Light */}
      {level === 0 && (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-6">
            <span className="text-7xl">🧍‍♂️</span>
            <span className={`text-6xl px-6 py-2 rounded-2xl font-bold ${light === 'green' ? 'bg-green-500 text-gray-900' : light === 'fakegreen' ? 'bg-green-300 text-gray-900 border-4 border-red-500' : 'bg-red-500 text-white'}`}>{light === 'green' ? '🟢' : light === 'fakegreen' ? '🟢' : '🔴'}</span>
            <span className="text-7xl">👧</span>
          </div>
          <div className="relative w-full h-12 bg-gray-800 rounded-full mb-4">
            <div className="absolute left-0 top-0 h-12 bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${playerPos}%`, maxWidth: '100%' }}></div>
            <span className="absolute left-0 top-0 h-12 flex items-center justify-center" style={{ left: `calc(${playerPos}% - 24px)` }}>
              <span className="text-4xl">🧍‍♂️</span>
            </span>
            <span className="absolute right-0 top-0 h-12 flex items-center justify-center">
              <span className="text-4xl">🏁</span>
            </span>
          </div>
          <button onClick={handleRedLightGreenLight} className="w-full bg-amber-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-amber-600 transition-colors mt-2">▶️</button>
        </div>
      )}
      {/* Dalgona Candy */}
      {level === 1 && (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-7xl">🍬</span>
            <span className="text-5xl ml-4">{shape.emoji}</span>
          </div>
          {/* Prominent timer display */}
          <div className="mb-2 text-3xl font-bold text-amber-300 flex items-center gap-2">
            <span className="text-4xl">⏰</span>
            <span>{timer}s</span>
          </div>
          <div
            className={`relative w-full h-10 bg-gray-800 rounded-full mb-2 cursor-pointer transition-transform duration-150 ${crackAnim ? 'animate-shake' : ''}`}
            onClick={handleDalgona}
            style={{ position: 'relative' }}
          >
            <div className="absolute top-0 left-0 h-10 bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            {/* Precision zone */}
            <div className="absolute top-0 h-10 rounded-full border-4 border-green-400 opacity-80" style={{ left: `${precision}%`, width: '5%', pointerEvents: 'none' }}></div>
            {/* Crack overlay if crackMeter > 60 */}
            {crackMeter > 60 && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-4xl animate-pulse" style={{ zIndex: 2 }}>
                  💥
                </div>
                {/* Simple jagged SVG line overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                  <polyline points="0,10 10,20 20,5 30,25 40,10 50,20 60,5 70,25 80,10 90,20 100,5 110,25 120,10 130,20 140,5 150,25 160,10 170,20 180,5 190,25 200,10" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" />
                </svg>
              </>
            )}
          </div>
          {crackAnim && (
            <div className="text-red-400 font-bold text-lg animate-pulse mb-1">Cracked!</div>
          )}
          <div className="w-full bg-red-900/40 rounded-full h-3 mb-2">
            <div className="bg-red-500 h-3 rounded-full" style={{ width: `${crackMeter}%` }}></div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl">Progress</span>
            <span className="text-2xl">{crackMeter > 60 ? '💥' : ''}</span>
          </div>
        </div>
      )}
      {/* Tug of War */}
      {level === 2 && (
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-4xl">🧑‍🤝‍🧑🧑‍🤝‍🧑</span>
            <div className="flex-1 mx-2 relative h-10 bg-gray-800 rounded-full">
              <div className="absolute top-0 h-10 bg-amber-400 rounded-full transition-all duration-300" style={{ left: 0, width: `${ropePos}%` }}></div>
              <span className="absolute left-0 top-0 h-10 flex items-center justify-center" style={{ left: `calc(${ropePos}% - 24px)` }}>
                <span className="text-4xl">🤼‍♂️</span>
              </span>
            </div>
            <span className="text-4xl">🤖🤖</span>
          </div>
          <div className="w-full bg-blue-900/40 rounded-full h-3 mb-2">
            <div className="bg-blue-400 h-3 rounded-full" style={{ width: `${100 - fatigue}%` }}></div>
          </div>
          <button onClick={handleTugOfWar} className="w-full bg-amber-500 text-gray-900 px-8 py-4 rounded-2xl font-bold text-2xl hover:bg-amber-600 transition-colors mt-2">💪</button>
        </div>
      )}
    </div>
  );
};

export default SquidGame;