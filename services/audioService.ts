import { InstrumentType } from "../types";

class AudioService {
  private audioContext: AudioContext | null = null;
  private instrument: InstrumentType = 'piano';

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

  public setInstrument(type: InstrumentType) {
    this.instrument = type;
  }

  private getFrequency(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    // Basic parsing for simple scientific notation (e.g. C4, F#5)
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
    const now = this.audioContext.currentTime;

    // Instrument specific synthesis
    switch (this.instrument) {
      case 'synth':
        // Warm Synth: Sawtooth with Lowpass Filter
        oscillator.type = 'sawtooth';
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1500, now + 0.1); // Filter sweep
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        
        // Envelope: Slower attack, longer sustain
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        oscillator.stop(now + 0.8);
        break;

      case 'flute':
        // Flute: Sine wave with soft attack
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        
        // Envelope: Soft attack, steady sustain
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.08); 
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        oscillator.stop(now + 0.6);
        break;

      case '8bit':
        // 8-Bit: Square wave, snappy
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        
        // Envelope: Instant attack, short decay
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        oscillator.stop(now + 0.2);
        break;

      case 'piano':
      default:
        // Piano-ish: Triangle wave
        oscillator.type = 'triangle';
        oscillator.connect(gainNode);

        // Envelope: Sharp attack, natural decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        oscillator.stop(now + 0.5);
        break;
    }

    gainNode.connect(this.audioContext.destination);
    oscillator.start(now);
  }
}

export const audioService = new AudioService();