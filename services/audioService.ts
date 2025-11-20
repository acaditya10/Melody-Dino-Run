class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // AudioContext must be initialized after user interaction
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(err => console.warn("Audio resume failed", err));
    }
  }

  public resume() {
    this.init();
  }

  private getFrequency(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    // Basic parsing for simple scientific notation (e.g. C4, F#5)
    // Handle flats if necessary (simple conversion: Db -> C#)
    let cleanNote = note.toUpperCase().replace('DB', 'C#').replace('EB', 'D#').replace('GB', 'F#').replace('AB', 'G#').replace('BB', 'A#');
    
    // Extract octave
    const octaveMatch = cleanNote.match(/\d+$/);
    const octave = octaveMatch ? parseInt(octaveMatch[0]) : 4;
    
    // Extract key
    const key = cleanNote.replace(/\d+$/, '');
    const keyIndex = notes.indexOf(key);
    
    if (keyIndex === -1) return 0;

    // Formula for frequency: f = 440 * (2^(n/12))
    // A4 is index 9 in octave 4.
    // C0 is the base for calculation logic often used, but let's just use offset from A4.
    // A4 = 440Hz.
    // A4 index absolute = 4 * 12 + 9 = 57 semitones from C0.
    
    const currentNoteAbsoluteIndex = (octave * 12) + keyIndex;
    const semitoneOffsetFromA4 = currentNoteAbsoluteIndex - 57;

    return 440 * Math.pow(2, semitoneOffsetFromA4 / 12);
  }

  public playNote(note: string) {
    this.init();
    if (!this.audioContext) return;

    const freq = this.getFrequency(note);
    if (freq <= 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Triangle wave sounds a bit more like a chiptune/piano hybrid
    oscillator.type = 'triangle'; 
    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
}

export const audioService = new AudioService();