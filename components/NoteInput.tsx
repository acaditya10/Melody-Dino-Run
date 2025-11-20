import React, { useState } from 'react';
import { generateNotesFromInput } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { NoteData } from '../types';
import { Button } from './Button';
import { Music, Play } from 'lucide-react';

interface NoteInputProps {
  onNotesReady: (notes: NoteData[], bpm: number) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ onNotesReady }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter some notes!');
      return;
    }

    // CRITICAL: Resume audio context here on a user click event
    audioService.resume();

    setIsLoading(true);
    setError('');

    try {
      // This is now a local parser, so it's very fast
      const result = await generateNotesFromInput(input);
      if (result.notes && result.notes.length > 0) {
        onNotesReady(result.notes, result.bpm || 120);
      } else {
        setError('No valid notes found. Try formats like "C4 D4 E4".');
      }
    } catch (err) {
      setError('Something went wrong parsing your notes.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-defined quick select options with raw notes
  const quickOptions = [
    { label: "C Major Scale", value: "C4 D4 E4 F4 G4 A4 B4 C5" },
    { label: "Twinkle Twinkle", value: "C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4" },
    { label: "Arpeggio", value: "C4 E4 G4 C5 E5 G5 C6" },
    { label: "Chromatic Run", value: "C4 C#4 D4 D#4 E4 F4 F#4 G4" }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      <div className="bg-indigo-900 p-4 rounded-full mb-6 shadow-inner">
        <Music className="w-12 h-12 text-indigo-300" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-center font-retro text-indigo-400">
        Composer Mode
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Type notes directly (e.g., <strong>C4, F#5, H3</strong>). 
        <br/>Supported octaves: 0-8. H works as B.
      </p>

      <div className="w-full mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g. C4 D4 E4 F4 G4 A4 B4 C5"
          className="w-full h-32 p-4 bg-gray-900 text-white rounded-xl border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 transition-all resize-none placeholder-gray-600 font-mono text-lg uppercase"
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
            key={opt.label}
            onClick={() => setInput(opt.value)}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors border border-gray-600"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Button 
        onClick={handleSubmit} 
        isLoading={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Start Game
      </Button>
    </div>
  );
};