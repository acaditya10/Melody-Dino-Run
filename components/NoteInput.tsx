import React, { useState } from 'react';
import { generateNotesFromInput } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { NoteData } from '../types';
import { Button } from './Button';
import { Music, Sparkles } from 'lucide-react';

interface NoteInputProps {
  onNotesReady: (notes: NoteData[], bpm: number) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ onNotesReady }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter a melody or song name!');
      return;
    }

    // CRITICAL: Resume audio context here on a user click event
    // This ensures the browser allows audio playback later in the game
    audioService.resume();

    setIsLoading(true);
    setError('');

    try {
      const result = await generateNotesFromInput(input);
      if (result.notes && result.notes.length > 0) {
        onNotesReady(result.notes, result.bpm || 110);
      } else {
        setError('Could not generate notes. Try something simpler like "Play C Scale".');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-defined quick select options
  const quickOptions = [
    "C Major Scale",
    "Twinkle Twinkle Little Star",
    "Super Mario Theme",
    "Beethoven's 5th",
    "Fast Jazz Bebop"
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      <div className="bg-indigo-900 p-4 rounded-full mb-6 shadow-inner">
        <Music className="w-12 h-12 text-indigo-300" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-center font-retro text-indigo-400">
        Maestro Dino
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Enter a song name or notes. The obstacles will spawn to the rhythm of the music!
      </p>

      <div className="w-full mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 'Play the Star Wars theme' or 'C4 D4 E4 C4'..."
          className="w-full h-32 p-4 bg-gray-900 text-white rounded-xl border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 transition-all resize-none placeholder-gray-600 font-mono text-sm"
        />
      </div>

      {error && (
        <div className="text-red-400 text-xs mb-4 font-bold bg-red-900/20 px-3 py-2 rounded w-full text-center">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {quickOptions.map(opt => (
          <button
            key={opt}
            onClick={() => setInput(opt)}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors border border-gray-600"
          >
            {opt}
          </button>
        ))}
      </div>

      <Button 
        onClick={handleSubmit} 
        isLoading={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Generate Level
      </Button>
    </div>
  );
};