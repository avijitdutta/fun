import { Shape } from './types';

export const BOARD_SIZE = 12;

const createShape = (id: string, points: [number, number][], color: string): Shape => ({
  id,
  points: points.map(([x, y]) => ({ x, y })),
  color,
});

export const SHAPES_TEMPLATES: Omit<Shape, 'color'>[] = [
  { id: '1x1', points: [[0, 0]] },
  { id: '1x2', points: [[0, 0], [0, 1]] },
  { id: '1x3', points: [[0, 0], [0, 1], [0, 2]] },
  { id: 'L3', points: [[0, 0], [1, 0], [0, 1]] },
  { id: '2x2', points: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { id: 'I4', points: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { id: 'L4', points: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { id: 'T4', points: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { id: 'Z4', points: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { id: 'I5', points: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
  { id: 'L5', points: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  { id: 'P5', points: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { id: 'T5', points: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { id: 'U5', points: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  { id: 'V5', points: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
  { id: 'W5', points: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
  { id: 'X5', points: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { id: 'Z5', points: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
].map(s => ({ ...s, points: s.points.map(([x, y]) => ({ x, y })) }));

export const PLAYER_COLORS = {
  player1: '#3b82f6', // blue-500
  player2: '#ef4444', // red-500
};
