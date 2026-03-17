
export type Player = 'player1' | 'player2';

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  points: Point[]; // Relative to origin (0,0)
  color: string;
}

export interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  player1Shapes: Shape[];
  player2Shapes: Shape[];
  selectedShapeId: string | null;
  rotation: number; // 0, 90, 180, 270
  isGameOver: boolean;
  scores: {
    player1: number;
    player2: number;
  };
}
