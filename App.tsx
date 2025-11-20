import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { NoteInput } from './components/NoteInput';
import { GameState, NoteData } from './types';
import { Button } from './components/Button';
import { RotateCcw, ArrowLeft, Home } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [notesData, setNotesData] = useState<NoteData[]>([]);
  const [bpm, setBpm] = useState(110);
  const [lastScore, setLastScore] = useState(0);
  // Used to force a complete reset of the GameCanvas component
  const [gameSessionId, setGameSessionId] = useState(0);

  const handleNotesReady = (generatedNotes: NoteData[], generatedBpm: number) => {
    setNotesData(generatedNotes);
    setBpm(generatedBpm);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setGameState(GameState.GAME_OVER);
  };

  const restartGame = () => {
    // Increment session ID to force GameCanvas to remount and reset internal state
    setGameSessionId(prev => prev + 1);
    setGameState(GameState.PLAYING);
  };

  const goHome = () => {
    setGameState(GameState.MENU);
    setNotesData([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-gray-950 relative">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-4xl mb-8">
        <h1 className="text-4xl md:text-6xl font-retro text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8 drop-shadow-lg">
          MELODY RUN
        </h1>

        {gameState === GameState.MENU && (
          <div className="animate-fade-in-up">
            <NoteInput onNotesReady={handleNotesReady} />
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <div className="flex flex-col items-center animate-fade-in w-full">
             <div className="w-full max-w-3xl flex justify-between mb-2">
                <Button onClick={goHome} variant="secondary" className="py-2 px-4 text-xs flex items-center gap-2">
                  <Home className="w-3 h-3" />
                  Home
                </Button>
                <Button onClick={restartGame} variant="secondary" className="py-2 px-4 text-xs flex items-center gap-2">
                  <RotateCcw className="w-3 h-3" />
                  Restart
                </Button>
             </div>
             <GameCanvas 
               key={gameSessionId}
               notesData={notesData}
               bpm={bpm}
               onGameOver={handleGameOver} 
               gameActive={true}
             />
             <div className="mt-6 text-gray-400 text-sm font-mono bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 text-center">
               <p className="mb-2 text-indigo-300 font-bold">YOU CONTROL THE TEMPO!</p>
               Tap <span className="text-white font-bold border border-gray-500 px-1 rounded">ANY KEY</span> or <span className="text-white font-bold border border-gray-500 px-1 rounded">CLICK/TAP</span> screen repeatedly to play.
             </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-2xl border-2 border-gray-700 shadow-2xl animate-bounce-in">
            <h2 className="text-3xl font-retro text-red-400 mb-4">GAME OVER</h2>
            <div className="text-xl mb-8 font-mono text-gray-300">
              Final Score: <span className="text-white font-bold">{lastScore}</span>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={goHome} variant="secondary" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                New Song
              </Button>
              <Button onClick={restartGame} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="absolute bottom-4 text-gray-500 text-xs font-mono z-10 opacity-70 hover:opacity-100 transition-opacity select-none">
        Made by Aditya Chandra
      </footer>
    </div>
  );
};

export default App;