export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300;

// Physics for snappy, rhythmic jumping
// Higher gravity and jump strength for shorter air-time (approx 15 frames / 0.25s)
// This allows the user to tap fast rhythms (up to ~240 BPM).
export const GRAVITY = 2.5; 
export const JUMP_STRENGTH = -18; 

// Movement calculation:
// Jump Duration = 2 * (18 / 2.5) = 14.4 frames.
// We want the obstacle to move a fixed distance during this jump.
export const SCROLL_SPEED = 12; 

export const GROUND_Y = 250;
export const DINO_X = 100; // Dino is slightly forward
export const DINO_WIDTH = 40;
export const DINO_HEIGHT = 44;