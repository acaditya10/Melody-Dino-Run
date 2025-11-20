import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DINO_HEIGHT, DINO_WIDTH, DINO_X, GRAVITY, GROUND_Y, JUMP_STRENGTH, SCROLL_SPEED } from '../constants';
import { NoteData } from '../types';
import { audioService } from '../services/audioService';
import { inputService } from '../services/inputService';

interface GameCanvasProps {
  notesData: NoteData[];
  bpm: number;
  onGameOver: (score: number) => void;
  gameActive: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ notesData, bpm, onGameOver, gameActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  // Determine spacing based on physics
  const jumpDuration = Math.abs((2 * JUMP_STRENGTH) / GRAVITY);
  const obstacleSpacing = jumpDuration * SCROLL_SPEED;

  // Game State Refs
  const dinoRef = useRef({ y: GROUND_Y - DINO_HEIGHT, velocityY: 0, isJumping: false });
  const gameStateRef = useRef({
    worldOffset: 0, 
    noteIndex: 0,
  });
  
  // Input Buffer Ref - Allows queuing a jump if pressed while in air
  const jumpSignalRef = useRef(false);
  
  const gameLoopRef = useRef<number>(0);

  // --- Input Subscription ---
  useEffect(() => {
    const handleInput = () => {
      jumpSignalRef.current = true;
    };

    const unsubscribe = inputService.subscribe(handleInput);
    return () => unsubscribe();
  }, []);

  // --- Game Loop ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset state on mount/restart
    dinoRef.current = { y: GROUND_Y - DINO_HEIGHT, velocityY: 0, isJumping: false };
    gameStateRef.current = { worldOffset: 0, noteIndex: 0 };
    jumpSignalRef.current = false;
    setScore(0);

    const performJump = () => {
        if (!notesData || notesData.length === 0) return;

        dinoRef.current.velocityY = JUMP_STRENGTH;
        dinoRef.current.isJumping = true;
        jumpSignalRef.current = false; // Consume signal

        // Play Audio
        const note = notesData[gameStateRef.current.noteIndex % notesData.length];
        if (note) {
          audioService.playNote(note.pitch);
        }

        // Increment Game State
        gameStateRef.current.noteIndex++;
        setScore(s => s + 1);
    };

    const drawDino = (ctx: CanvasRenderingContext2D, x: number, y: number, isJumping: boolean) => {
        ctx.fillStyle = '#E0E7FF'; // Indigo-100
        ctx.fillRect(x, y, DINO_WIDTH, DINO_HEIGHT);
        
        // Eye
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(x + DINO_WIDTH - 12, y + 8, 6, 6);
    
        // Legs
        if (!isJumping) {
           ctx.fillStyle = '#E0E7FF';
           ctx.fillRect(x + 8, y + DINO_HEIGHT, 6, 4);
           ctx.fillRect(x + 24, y + DINO_HEIGHT, 6, 4);
        } else {
           ctx.fillStyle = '#E0E7FF';
           ctx.fillRect(x + 4, y + DINO_HEIGHT - 4, 6, 6);
           ctx.fillRect(x + 30, y + DINO_HEIGHT - 4, 6, 6);
        }
    };

    const drawObstacle = (ctx: CanvasRenderingContext2D, x: number, y: number, noteLabel: string) => {
        ctx.fillStyle = '#10B981'; // Emerald-500
        const w = 25;
        const h = 40;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#065F46';
        ctx.fillRect(x + 4, y + 4, 4, h - 8);
        ctx.fillStyle = '#A7F3D0';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(noteLabel, x + w/2, y - 10);
    };

    const update = () => {
      if (!gameActive) return;
      
      // --- UPDATE PHYSICS ---

      if (dinoRef.current.isJumping) {
        // Apply Gravity
        dinoRef.current.velocityY += GRAVITY;
        dinoRef.current.y += dinoRef.current.velocityY;

        // Scroll World
        gameStateRef.current.worldOffset += SCROLL_SPEED;

        // Check Landing
        if (dinoRef.current.y >= GROUND_Y - DINO_HEIGHT) {
            dinoRef.current.y = GROUND_Y - DINO_HEIGHT;
            dinoRef.current.velocityY = 0;
            dinoRef.current.isJumping = false;
            
            // If user pressed key while we were in air, jump again immediately (Input Buffering)
            if (jumpSignalRef.current) {
                performJump();
            }
        }
      } else {
        // On Ground: Wait for input
        if (jumpSignalRef.current) {
            performJump();
        }
      }

      // --- RENDER ---
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground Line
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Obstacles
      if (notesData.length > 0) {
        // Calculate visible range to optimize rendering
        const firstVisibleIndex = Math.floor((gameStateRef.current.worldOffset - 100) / obstacleSpacing);
        const lastVisibleIndex = firstVisibleIndex + Math.ceil(CANVAS_WIDTH / obstacleSpacing) + 2;
        const initialOffset = DINO_X + obstacleSpacing / 2;

        for (let i = Math.max(0, firstVisibleIndex); i < lastVisibleIndex; i++) {
            const note = notesData[i % notesData.length];
            if (note) {
              const absX = initialOffset + (i * obstacleSpacing);
              const screenX = absX - gameStateRef.current.worldOffset;
              drawObstacle(ctx, screenX, GROUND_Y - 40, note.pitch);
            }
        }
      }

      // Dino
      drawDino(ctx, DINO_X, dinoRef.current.y, dinoRef.current.isJumping);

      // HUD
      ctx.fillStyle = '#6366f1';
      ctx.font = '12px "Press Start 2P"';
      ctx.textAlign = 'right';
      
      if (notesData.length > 0) {
        const nextNote = notesData[gameStateRef.current.noteIndex % notesData.length];
        if (nextNote) {
           ctx.fillText(`NEXT: ${nextNote.pitch}`, CANVAS_WIDTH - 20, 30);
        }
      }
      
      // Start Prompt
      if (!dinoRef.current.isJumping && gameStateRef.current.noteIndex === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.textAlign = 'center';
          ctx.font = '14px "Press Start 2P"';
          ctx.fillText("TAP OR PRESS ANY KEY", CANVAS_WIDTH/2, 100);
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameActive, notesData, obstacleSpacing]);

  const totalNotes = notesData.length;
  const currentNote = (score % totalNotes) + 1;

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto border-4 border-indigo-900 rounded-xl overflow-hidden shadow-2xl bg-gray-800 select-none outline-none ring-0"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto block bg-gray-800 cursor-pointer"
        style={{ imageRendering: 'pixelated', touchAction: 'none' }}
      />
      
      {/* Score HUD - pointer-events-none is crucial here */}
      <div className="absolute top-4 left-4 font-retro text-white text-lg shadow-sm z-10 pointer-events-none">
        <div>SCORE: {score.toString().padStart(5, '0')}</div>
        {totalNotes > 0 && (
          <div className="text-xs text-indigo-300 mt-2">
            NOTE: {currentNote}/{totalNotes}
          </div>
        )}
      </div>
    </div>
  );
};