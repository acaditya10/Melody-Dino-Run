import { ParsedNotesResponse } from "../types";

// This service has been converted from an AI generator to a local string parser
// to support direct user input without API keys.

export const generateNotesFromInput = async (userInput: string): Promise<ParsedNotesResponse> => {
  // Mimic async behavior to keep component interface consistent
  return new Promise((resolve) => {
    // 1. Normalize input: Uppercase
    let processedInput = userInput.toUpperCase();
    
    // 2. Handle German notation: H -> B
    processedInput = processedInput.replace(/H/g, 'B');

    // 3. Regex to find notes.
    // Structure: [A-G], optional [# or B (flat)], followed by a digit [0-9]
    // Example matches: C4, F#5, DB3, B7
    const noteRegex = /([A-G][#B]?\d)/g;
    
    const matches = processedInput.match(noteRegex);

    if (!matches || matches.length === 0) {
      // Return a default sequence if the user typed nonsense or nothing valid
      resolve({
        bpm: 120,
        notes: [
          { pitch: "C4", duration: 1 }, 
          { pitch: "E4", duration: 1 }, 
          { pitch: "G4", duration: 1 }, 
          { pitch: "C5", duration: 1 },
          { pitch: "B4", duration: 1 },
          { pitch: "G4", duration: 1 }
        ],
        description: "Default C Major (No valid notes found)"
      });
      return;
    }

    // 4. Map matches to NoteData objects
    const notes = matches.map(pitch => ({
      pitch: pitch,
      duration: 1 // Default duration for manual input
    }));

    resolve({
      bpm: 120, // Standard tempo for manual play
      notes: notes,
      description: "Custom Note Sequence"
    });
  });
};