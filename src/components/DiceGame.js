import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Users, Info } from 'lucide-react';

const DiceGame = () => {
  // Game state
  const [screen, setScreen] = useState('welcome');
  const [gameSettings, setGameSettings] = useState({
    playerCount: 2,
    gameType: 1
  });
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameRound, setGameRound] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFirstPlayer, setIsFirstPlayer] = useState(true);
  const [gameLog, setGameLog] = useState([]);
  const [showRules, setShowRules] = useState(false);
  const [showLastRollDetails, setShowLastRollDetails] = useState(false);
  const audioRef = useRef(null);

  // Player position calculation for oval table
  const getPlayerPosition = (index, total) => {
    const angle = (index * 360) / Math.min(total, 10);
    const radiusX = 45; // horizontal radius for oval
    const radiusY = 35; // vertical radius for oval
    const x = 50 + radiusX * Math.cos((angle - 90) * Math.PI / 180);
    const y = 50 + radiusY * Math.sin((angle - 90) * Math.PI / 180);
    return { x: `${x}%`, y: `${y}%` };
  };

  // Enhanced avatars
  const avatarEmojis = [
    '🧑‍💼', '👩‍🦰', '🧑‍🎨', '👨‍🏫', '👩‍⚕️', 
    '🧑‍🚀', '👩‍🎤', '👨‍🍳', '👩‍🔬', '🧑‍🎮'
  ];

  const avatarGradients = [
    'bg-gradient-to-br from-red-400 to-red-600',
    'bg-gradient-to-br from-blue-400 to-blue-600', 
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-orange-400 to-red-500',
    'bg-gradient-to-br from-teal-400 to-teal-600',
    'bg-gradient-to-br from-gray-400 to-gray-600'
  ];

  // Sound effects
  const playDiceSound = () => {
    if (soundEnabled && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Sound play failed:', e));
      } catch (error) {
        console.log('Sound error:', error);
      }
    }
  };

  // Score calculation
  const calculateScore = (dice) => {
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const values = Object.values(counts).sort((a,b) => b-a);
    const sortedDice = [...dice].sort((a,b) => a-b);
    
    // 5 of a kind
    if (values[0] === 5) {
      const num = Object.keys(counts).find(k => counts[k] === 5);
      return 5000 * parseInt(num);
    }
    
    // Straight
    if (sortedDice.join('') === '12345' || sortedDice.join('') === '23456') {
      return 10000;
    }
    
    // 4 of a kind
    if (values[0] === 4) {
      const num = Object.keys(counts).find(k => counts[k] === 4);
      return 1500 * parseInt(num);
    }
    
    // Full house (3+2)
    if (values[0] === 3 && values[1] === 2) {
      const threeNum = Object.keys(counts).find(k => counts[k] === 3);
      return 500 * parseInt(threeNum);
    }
    
    // 3 of a kind
    if (values[0] === 3) {
      const threeNum = Object.keys(counts).find(k => counts[k] === 3);
      return 250 * parseInt(threeNum);
    }
    
    // Two pairs
    if (values[0] === 2 && values[1] === 2) {
      const pairs = Object.keys(counts).filter(k => counts[k] === 2).map(Number);
      return 100 * Math.max(...pairs);
    }
    
    // One pair
    if (values[0] === 2) {
      const pairNum = Object.keys(counts).find(k => counts[k] === 2);
      return 10 * parseInt(pairNum);
    }
    
    // No combination
    return dice.reduce((sum, d) => sum + d, 0);
  };

  // Get combination name
  const getScoreCombination = (dice) => {
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const values = Object.values(counts).sort((a,b) => b-a);
    const sortedDice = [...dice].sort((a,b) => a-b);
    
    if (values[0] === 5) return '🎯 5 זהות!';
    if (sortedDice.join('') === '12345' || sortedDice.join('') === '23456') return '🎲 רצף מלא!';
    if (values[0] === 4) return '🔥 4 זהות';
    if (values[0] === 3 && values[1] === 2) return '🏠 פול האוס';
    if (values[0] === 3) return '✨ 3 זהות';
    if (values[0] === 2 && values[1] === 2) return '👥 זוג כפול';
    if (values[0] === 2) return '👫 זוג';
    return '🎯 ללא קומבינציה';
  };

  // Enhanced dice rolling
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setShowLastRollDetails(false);
    playDiceSound();
    
    let rollCount = 0;
    const maxRolls = 15;
    
    const rollInterval = setInterval(() => {
      rollCount++;
      setDiceResults(Array.from({length: 5}, () => Math.floor(Math.random() * 6) + 1));
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        
        setTimeout(() => {
          const finalResults = Array.from({length: 5}, () => Math.floor(Math.random() * 6) + 1);
          setDiceResults(finalResults);
          
          const score = calculateScore(finalResults);
          const combination = getScoreCombination(finalResults);
          
          // Update player
          const newPlayers = [...players];
          if (newPlayers[currentPlayerIndex]) {
            newPlayers[currentPlayerIndex].totalScore += score;
            newPlayers[currentPlayerIndex].lastRoll = {
              dice: finalResults,
              score: score,
              combination: combination
            };
            setPlayers(newPlayers);
          }
          
          setIsRolling(false);
          setShowLastRollDetails(true);
          
          // Move to next turn after delay
          setTimeout(() => {
            nextTurn();
          }, 3000);
        }, 500);
      }
    }, 120);
  };

  // Turn management
  const nextTurn = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    const playersWithRolls = activePlayers.filter(p => p.lastRoll);
    
    if (playersWithRolls.length === activePlayers.length && activePlayers.length > 1) {
      // Round complete - eliminate lowest scorer
      const lowestScore = Math.min(...activePlayers.map(p => p.totalScore));
      const lowestPlayers = activePlayers.filter(p => p.totalScore === lowestScore);
      
      const newPlayers = players.map(p => ({
        ...p,
        eliminated: p.eliminated || lowestPlayers.includes(p),
        lastRoll: null
      }));
      
      setPlayers(newPlayers);
      setShowLastRollDetails(false);
      setDiceResults([]); // Clear dice results when round ends
      
      const remaining = newPlayers.filter(p => !p.eliminated);
      if (remaining.length <= 1) {
        setScreen('gameOver');
        return;
      }
      
      setGameRound(gameRound + 1);
      setCurrentPlayerIndex(newPlayers.findIndex(p => !p.eliminated));
    } else {
      // Move to next player - keep dice results visible
      let nextIndex = currentPlayerIndex;
      do {
        nextIndex = (nextIndex + 1) % players.length;
      } while (players[nextIndex] && (players[nextIndex].eliminated || players[nextIndex].lastRoll));
      
      setCurrentPlayerIndex(nextIndex);
      setShowLastRollDetails(false);
    }
  };

  // Add player with validation
  const addPlayer = (name) => {
    if (!name || name.trim().length < 2) {
      alert('שם השחקן חייב להיות לפחות 2 תווים');
      return false;
    }
    
    if (players.some(p => p.name === name.trim())) {
      alert('שם זה כבר קיים - בחר שם אחר');
      return false;
    }
    
    if (players.length < gameSettings.playerCount) {
      setPlayers([...players, {
        id: players.length + 1,
        name: name.trim(),
        totalScore: 0,
        eliminated: false,
        lastRoll: null
      }]);
      
      if (players.length + 1 === gameSettings.playerCount) {
        setScreen('game');
      }
      return true;
    }
    return false;
  };

  // Reset game
  const resetGame = () => {
    setScreen('welcome');
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setGameRound(1);
    setDiceResults([]);
    setIsFirstPlayer(true);
    setGameLog([]);
    setShowLastRollDetails(false);
    setGameSettings({ playerCount: 2, gameType: 1 });
  };

  // Game rules component
  const GameRules = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl max-h-96 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">🎲 הוראות המשחק</h3>
        <div className="space-y-3 text-right">
          <div>
            <h4 className="font-bold text-lg">מטרת המשחק:</h4>
            <p>להיות השחקן האחרון שנשאר במשחק!</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg">מהלך המשחק:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>כל שחקן בתורו זורק 5 קוביות</li>
              <li>המערכת מחשבת את הניקוד לפי הקומבינציה</li>
              <li>בסוף כל סיבוב, השחקן עם הניקוד הנמוך ביותר נפסל</li>
              <li>המשחק ממשיך עד שנשאר שחקן אחד - המנצח!</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-bold text-lg">טבלת ניקוד:</h4>
            <div className="text-sm space-y-1">
              <div>🎯 5 זהות: 5,000 × המספר</div>
              <div>🎲 רצף מלא: 10,000 נקודות</div>
              <div>🔥 4 זהות: 1,500 × המספר</div>
              <div>🏠 פול האוס: 500 × המספר של השלישייה</div>
              <div>✨ 3 זהות: 250 × המספר</div>
              <div>👥 זוג כפול: 100 × הזוג הגבוה</div>
              <div>👫 זוג: 10 × המספר</div>
              <div>🎯 ללא קומבינציה: סכום כל הקוביות</div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowRules(false)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg w-full"
        >
          הבנתי!
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4" dir="rtl">
      <style>{`
        @keyframes diceRoll {
          0% { transform: rotateX(0deg) rotateY(0deg) scale(1); }
          25% { transform: rotateX(90deg) rotateY(90deg) scale(1.1); }
          50% { transform: rotateX(180deg) rotateY(180deg) scale(1); }
          75% { transform: rotateX(270deg) rotateY(270deg) scale(1.1); }
          100% { transform: rotateX(360deg) rotateY(360deg) scale(1); }
        }
        
        .dice-roll {
          animation: diceRoll 0.15s linear infinite;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.9); }
        }
        
        .player-glow {
          animation: glow 1.5s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-8px,0); }
          70% { transform: translate3d(0,-4px,0); }
          90% { transform: translate3d(0,-2px,0); }
        }
        
        .dice-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEUATR2y/LPfOcFKnHM8dmINgkRbL3tqW8aBDNEn9/us2QZNB9B"
      />

      {/* Game Rules Modal */}
      {showRules && <GameRules />}

      {/* Welcome Screen */}
      {screen === 'welcome' && (
        <div className="text-center bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-6xl mb-4 animate-bounce">🎲</div>
          <h2 className="text-3xl font-bold text-green-800 mb-2">משחק הקוביות</h2>
          <h3 className="text-xl text-green-600 mb-8">של נועם</h3>
          
          <button 
            onClick={() => setScreen('setup')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl w-full transition-all duration-300 transform hover:scale-105 mb-4 flex items-center justify-center gap-2"
          >
            <Users size={24} />
            התחל משחק חדש
          </button>
          
          <button 
            onClick={() => setShowRules(true)}
            className="text-green-600 hover:text-green-700 underline flex items-center justify-center gap-2 w-full"
          >
            <Info size={20} />
            הוראות המשחק
          </button>
        </div>
      )}

      {/* Setup Screen */}
      {screen === 'setup' && (
        <div className="text-center bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎮 הגדרת משחק</h2>
          
          {isFirstPlayer && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">כמות שחקנים</label>
                <select 
                  value={gameSettings.playerCount}
                  onChange={(e) => setGameSettings({...gameSettings, playerCount: parseInt(e.target.value)})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-center focus:border-green-500 focus:outline-none"
                >
                  {[2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>{n} שחקנים</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">סוג משחק</label>
                <select 
                  value={gameSettings.gameType}
                  onChange={(e) => setGameSettings({...gameSettings, gameType: parseInt(e.target.value)})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-center focus:border-green-500 focus:outline-none"
                >
                  <option value={1}>🎯 שחקן מול שחקן</option>
                  <option value={2} disabled>🤖 מול דילר (בקרוב)</option>
                  <option value={3} disabled>💰 הימורים (בקרוב)</option>
                </select>
              </div>
            </>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              {isFirstPlayer ? '👤 השחקן הראשון' : '👥 הצטרף למשחק'}
            </label>
            <input 
              type="text"
              placeholder={isFirstPlayer ? "הכנס את שמך (יוצר השולחן)" : "הכנס את שמך"}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-center focus:border-green-500 focus:outline-none"
              maxLength="15"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  if (addPlayer(e.target.value.trim())) {
                    e.target.value = '';
                    if (players.length + 1 < gameSettings.playerCount) {
                      setIsFirstPlayer(false);
                    }
                  }
                }
              }}
            />
          </div>
          
          <button 
            onClick={(e) => {
              const input = e.target.parentElement.querySelector('input');
              if (input.value.trim()) {
                if (addPlayer(input.value.trim())) {
                  input.value = '';
                  if (players.length + 1 < gameSettings.playerCount) {
                    setIsFirstPlayer(false);
                  }
                }
              } else {
                alert('אנא הכנס שם');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg w-full mb-4 transition-all duration-300 transform hover:scale-105"
          >
            {players.length === 0 ? '🎯 יצירת שולחן' : '👥 הצטרפות לשולחן'}
          </button>
          
          {players.length > 0 && (
            <div className="text-gray-600 bg-gray-50 rounded-lg p-4">
              <div className="font-bold mb-2">
                שחקנים במשחק: {players.length}/{gameSettings.playerCount}
              </div>
              <div className="space-y-1">
                {players.map((p, index) => (
                  <div key={p.id} className="text-sm flex items-center justify-center gap-2">
                    <span>{avatarEmojis[index]}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
              {players.length < gameSettings.playerCount && (
                <div className="text-sm text-blue-600 mt-2 animate-pulse">
                  ⏳ ממתין לעוד {gameSettings.playerCount - players.length} שחקנים...
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => setScreen('welcome')}
            className="text-gray-500 hover:text-gray-700 mt-4 flex items-center justify-center gap-2 w-full"
          >
            ← חזור
          </button>
        </div>
      )}

      {/* Game Screen */}
      {screen === 'game' && (
        <div className="w-full max-w-6xl mx-auto">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6">
            {/* Sound Control */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {soundEnabled ? <Volume2 size={24} className="text-green-600" /> : <VolumeX size={24} className="text-red-500" />}
            </button>

            {/* Game Info - Moved to left */}
            <div className="text-center text-white bg-black bg-opacity-30 rounded-xl px-6 py-3">
              <h2 className="text-xl font-bold">🎲 סיבוב {gameRound}</h2>
              <p className="text-sm">
                תור: <span className="font-bold text-yellow-300">{players[currentPlayerIndex]?.name}</span>
              </p>
              <p className="text-xs text-gray-300">
                שחקנים פעילים: {players.filter(p => !p.eliminated).length}
              </p>
            </div>

            {/* Reset Game */}
            <button
              onClick={() => {
                if (confirm('האם אתה בטוח שתרצה לאפס את המשחק?')) {
                  resetGame();
                }
              }}
              className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Game Table */}
          <div className="relative w-full h-80 mx-auto max-w-6xl">
            {/* Oval Table */}
            <div className="w-full h-full bg-green-600 rounded-full border-8 border-yellow-600 shadow-2xl" style={{borderRadius: '50%/40%'}}>
              {/* Table felt texture */}
              <div className="absolute inset-4 bg-green-600 rounded-full opacity-90" style={{borderRadius: '50%/40%'}}></div>
            </div>
            
            {/* Players around table */}
            {players.map((player, index) => {
              const pos = getPlayerPosition(index, players.length);
              const isCurrentPlayer = index === currentPlayerIndex;
              const isEliminated = player.eliminated;
              
              return (
                <div key={player.id}>
                  {/* Player Avatar and Info */}
                  <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 z-10 ${
                      isEliminated ? 'opacity-30 grayscale filter' : ''
                    } ${isCurrentPlayer && !isEliminated ? 'scale-110 z-20' : ''}`}
                    style={{ left: pos.x, top: pos.y }}
                  >
                    {/* Player Avatar */}
                    <div className={`w-20 h-20 ${avatarGradients[index]} rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg border-4 border-white transition-all duration-500 ${
                      isCurrentPlayer && !isEliminated ? 'ring-8 ring-yellow-400 ring-opacity-80 player-glow' : 'ring-2 ring-white ring-opacity-50'
                    } ${isEliminated ? 'bg-gray-400' : ''} hover:scale-105`}>
                      {isEliminated ? '💀' : avatarEmojis[index]}
                    </div>
                    
                    {/* Player Name */}
                    <div className={`text-white text-sm font-bold mb-1 ${
                      isCurrentPlayer && !isEliminated ? 'text-yellow-300 animate-pulse' : ''
                    } ${isEliminated ? 'line-through text-gray-400' : ''}`}>
                      {player.name}
                    </div>
                    
                    {/* Player Score */}
                    <div className={`text-sm font-bold mb-2 ${
                      isEliminated ? 'text-gray-400' : 'text-yellow-300'
                    }`}>
                      {player.totalScore.toLocaleString()} נק'
                    </div>
                    
                    {/* Last Roll Info */}
                    {player.lastRoll && !isEliminated && (
                      <div className="text-xs text-gray-200 mb-2 bg-black bg-opacity-50 rounded px-2 py-1">
                        {player.lastRoll.combination}<br/>
                        <span className="text-green-300 font-bold">+{player.lastRoll.score.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Elimination indicator */}
                    {isEliminated && (
                      <div className="text-xs text-red-400 font-bold mt-1 bg-red-900 bg-opacity-50 rounded px-2 py-1">
                        נפסל
                      </div>
                    )}
                  </div>

                  {/* Player's Dice Display - Closer to player */}
                  {player.lastRoll && !isEliminated && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ 
                        left: `${parseFloat(pos.x) + (index % 2 === 0 ? 8 : -8)}%`, 
                        top: `${parseFloat(pos.y) + (index < players.length/2 ? 4 : -4)}%` 
                      }}
                    >
                      <div className="flex gap-1 justify-center">
                        {player.lastRoll.dice.map((dice, diceIndex) => (
                          <div
                            key={diceIndex}
                            className="w-8 h-8 bg-white rounded-md text-black text-sm flex items-center justify-center font-bold border border-gray-400 shadow-lg transform hover:scale-110 transition-transform duration-200"
                          >
                            {dice}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Central Dice Area */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              {/* Current Dice Results - Only show when rolling or just finished */}
              {diceResults.length > 0 && (isRolling || showLastRollDetails) && (
                <div className="flex gap-3 mb-6 justify-center">
                  {diceResults.map((dice, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl font-bold border-3 border-gray-600 shadow-2xl transition-all duration-300 ${
                        isRolling ? 'dice-roll' : 'transform hover:scale-105 hover:shadow-xl'
                      }`}
                      style={{
                        animationDelay: isRolling ? `${index * 0.1}s` : '0s',
                        background: isRolling 
                          ? `linear-gradient(${45 + index * 72}deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)` 
                          : 'white',
                        backgroundSize: isRolling ? '200% 200%' : 'auto',
                      }}
                    >
                      <span className={`${isRolling ? 'dice-bounce' : ''} transition-all duration-200`}>
                        {dice}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Roll Button or Rolling Indicator */}
              {!isRolling && !players[currentPlayerIndex]?.eliminated && !players[currentPlayerIndex]?.lastRoll ? (
                <button
                  onClick={rollDice}
                  className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:via-orange-600 hover:to-red-700 text-white font-bold py-5 px-10 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🎲</span>
                    <div>
                      <div className="text-xl">זרוק קוביות</div>
                      <div className="text-sm opacity-90">{players[currentPlayerIndex]?.name}</div>
                    </div>
                    <span className="text-3xl animate-bounce" style={{animationDelay: '0.2s'}}>🎲</span>
                  </div>
                </button>
              ) : isRolling ? (
                <div className="text-white font-bold text-xl bg-black bg-opacity-70 rounded-xl px-8 py-6 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl animate-spin">🎲</span>
                    <div>
                      <div className="animate-pulse text-2xl">זורק קוביות...</div>
                      <div className="text-sm opacity-75">{players[currentPlayerIndex]?.name}</div>
                    </div>
                    <span className="text-4xl animate-spin" style={{animationDelay: '0.5s'}}>🎲</span>
                  </div>
                </div>
              ) : players[currentPlayerIndex]?.lastRoll ? (
                <div className="text-white font-bold text-lg bg-green-900 bg-opacity-80 rounded-xl px-6 py-4 shadow-xl">
                  <div className="text-center">
                    <div className="text-sm opacity-75 mb-1">ממתין לשחקן הבא...</div>
                    <div className="animate-pulse">⏳</div>
                  </div>
                </div>
              ) : (
                <div className="text-white font-bold text-lg bg-blue-900 bg-opacity-80 rounded-xl px-6 py-4 shadow-xl">
                  <div className="text-center">
                    <div className="text-sm opacity-75">מוכן לזריקה</div>
                    <div className="text-2xl">🎲</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Player's Last Roll Display */}
          {showLastRollDetails && players[currentPlayerIndex]?.lastRoll && (
            <div className="text-center text-white mt-6 bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-6 max-w-md mx-auto shadow-2xl border-2 border-green-400">
              <div className="text-2xl mb-2">{players[currentPlayerIndex].lastRoll.combination}</div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                +{players[currentPlayerIndex].lastRoll.score.toLocaleString()} נקודות
              </div>
              <div className="text-lg opacity-90">
                סה"כ: <span className="font-bold">{players[currentPlayerIndex].totalScore.toLocaleString()}</span> נקודות
              </div>
              
              {/* Dice display */}
              <div className="flex gap-2 justify-center mt-4">
                {players[currentPlayerIndex].lastRoll.dice.map((dice, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 bg-white rounded-lg text-black text-xl flex items-center justify-center font-bold shadow-lg"
                  >
                    {dice}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mt-6 bg-white bg-opacity-10 rounded-xl p-4 max-w-md mx-auto">
            <h3 className="text-white font-bold text-center mb-3">🏆 לוח תוצאות</h3>
            <div className="space-y-2">
              {players
                .filter(p => !p.eliminated)
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((player, index) => (
                  <div key={player.id} className={`flex items-center justify-between p-2 rounded-lg ${
                    index === 0 ? 'bg-yellow-500 bg-opacity-30' : 
                    index === 1 ? 'bg-gray-400 bg-opacity-30' : 
                    index === 2 ? 'bg-orange-500 bg-opacity-30' : 
                    'bg-white bg-opacity-10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className="text-white font-bold">{player.name}</span>
                    </div>
                    <span className="text-white font-bold">{player.totalScore.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {screen === 'gameOver' && (
        <div className="text-center bg-white rounded-xl p-8 shadow-2xl max-w-lg w-full">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-4xl font-bold text-yellow-600 mb-4">
            {players.find(p => !p.eliminated)?.name}
          </h2>
          <p className="text-2xl text-gray-700 mb-2">🎉 מנצח! 🎉</p>
          <p className="text-xl text-gray-600 mb-6">
            ניקוד סופי: <span className="font-bold text-green-600">
              {players.find(p => !p.eliminated)?.totalScore.toLocaleString()}
            </span> נקודות
          </p>
          
          {/* Final Rankings */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-3">🏅 דירוג סופי</h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((player, index) => (
                  <div key={player.id} className={`flex items-center justify-between p-2 rounded ${
                    !player.eliminated ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className={!player.eliminated ? 'font-bold' : 'line-through'}>
                        {player.name}
                      </span>
                    </div>
                    <span className="font-bold">{player.totalScore.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
          
          <button
            onClick={resetGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg w-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <RotateCcw size={24} />
            <span className="text-xl">משחק חדש</span>
            <span className="text-2xl">🎲</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DiceGame;
