import { audioService } from './audioService';

type InputCallback = () => void;

class InputService {
  private listeners: Set<InputCallback> = new Set();
  private isBound = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
  }

  private bind() {
    if (this.isBound) return;
    // Attach to document to ensure we catch events regardless of focus
    document.addEventListener('keydown', this.handleKeyDown);
    // Pointer events cover Mouse, Touch, and Pen
    document.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    this.isBound = true;
  }

  private unbind() {
    if (!this.isBound) return;
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('pointerdown', this.handlePointerDown);
    this.isBound = false;
  }

  public subscribe(callback: InputCallback): () => void {
    this.listeners.add(callback);
    // Auto-bind listeners when the first subscriber joins
    if (this.listeners.size > 0 && !this.isBound) {
      this.bind();
    }

    return () => {
      this.listeners.delete(callback);
      // Auto-unbind when no subscribers remain to prevent leaks
      if (this.listeners.size === 0) {
        this.unbind();
      }
    };
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Ignore modifier keys and system keys
    const ignoredKeys = [
      'F5', 'F11', 'F12', 'Tab', 'Alt', 'Control', 'Meta', 'Shift', 'CapsLock', 'Escape', 'ContextMenu'
    ];
    
    if (ignoredKeys.includes(e.key)) return;
    if (e.repeat) return;

    // Prevent default scrolling for game-relevant keys
    if ([' ', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }

    this.triggerAction();
  }

  private handlePointerDown(e: PointerEvent) {
    // Avoid triggering if clicking a UI element like a button, link, or input
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) {
      return;
    }

    // Only allow left click for mouse, but allow any touch contact
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault(); // Prevent scrolling/highlighting
    this.triggerAction();
  }

  private triggerAction() {
    // Critical: Resume audio context immediately on user interaction event
    audioService.resume();
    
    // Notify all subscribers (e.g., the GameCanvas)
    this.listeners.forEach(cb => cb());
  }
}

export const inputService = new InputService();
