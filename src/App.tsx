/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, RefreshCw, Trophy, User, Info, X } from 'lucide-react';
import { Player, Point, Shape, GameState } from './types';
import { BOARD_SIZE, SHAPES_TEMPLATES, PLAYER_COLORS } from './constants';

const INITIAL_SHAPES_P1 = SHAPES_TEMPLATES.map(s => ({ ...s, color: PLAYER_COLORS.player1 }));
const INITIAL_SHAPES_P2 = SHAPES_TEMPLATES.map(s => ({ ...s, color: PLAYER_COLORS.player2 }));

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: 'player1',
    player1Shapes: INITIAL_SHAPES_P1,
    player2Shapes: INITIAL_SHAPES_P2,
    selectedShapeId: null,
    rotation: 0,
    isGameOver: false,
    scores: { player1: 0, player2: 0 },
  });

  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [showRules, setShowRules] = useState(false);

  const selectedShape = useMemo(() => {
    const shapes = gameState.currentPlayer === 'player1' ? gameState.player1Shapes : gameState.player2Shapes;
    return shapes.find(s => s.id === gameState.selectedShapeId) || null;
  }, [gameState.currentPlayer, gameState.player1Shapes, gameState.player2Shapes, gameState.selectedShapeId]);

  const rotatedPoints = useMemo(() => {
    if (!selectedShape) return [];
    return selectedShape.points.map(p => {
      switch (gameState.rotation) {
        case 90: return { x: -p.y, y: p.x };
        case 180: return { x: -p.x, y: -p.y };
        case 270: return { x: p.y, y: -p.x };
        default: return p;
      }
    });
  }, [selectedShape, gameState.rotation]);

  const isValidMove = useCallback((points: Point[], x: number, y: number, board: (Player | null)[][], player: Player) => {
    let touchesCorner = false;
    let touchesEdge = false;
    let isFirstMove = true;

    // Check if player has any pieces on board
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === player) {
          isFirstMove = false;
          break;
        }
      }
      if (!isFirstMove) break;
    }

    for (const p of points) {
      const targetX = x + p.x;
      const targetY = y + p.y;

      // Out of bounds
      if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) return false;
      
      // Occupied
      if (board[targetY][targetX] !== null) return false;

      if (isFirstMove) {
        // First move must touch player's starting corner
        const cornerX = player === 'player1' ? 0 : BOARD_SIZE - 1;
        const cornerY = player === 'player1' ? 0 : BOARD_SIZE - 1;
        if (targetX === cornerX && targetY === cornerY) touchesCorner = true;
      } else {
        // Check neighbors
        const neighbors = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        const corners = [
          { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
        ];

        for (const n of neighbors) {
          const nx = targetX + n.dx;
          const ny = targetY + n.dy;
          if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            if (board[ny][nx] === player) touchesEdge = true;
          }
        }

        for (const c of corners) {
          const cx = targetX + c.dx;
          const cy = targetY + c.dy;
          if (cx >= 0 && cx < BOARD_SIZE && cy >= 0 && cy < BOARD_SIZE) {
            if (board[cy][cx] === player) touchesCorner = true;
          }
        }
      }
    }

    if (isFirstMove) return touchesCorner;
    return touchesCorner && !touchesEdge;
  }, []);

  const placeShape = (x: number, y: number) => {
    if (!selectedShape) return;
    
    if (isValidMove(rotatedPoints, x, y, gameState.board, gameState.currentPlayer)) {
      const newBoard = gameState.board.map(row => [...row]);
      rotatedPoints.forEach(p => {
        newBoard[y + p.y][x + p.x] = gameState.currentPlayer;
      });

      const newShapes = (gameState.currentPlayer === 'player1' ? gameState.player1Shapes : gameState.player2Shapes)
        .filter(s => s.id !== selectedShape.id);

      const newScores = { ...gameState.scores };
      newScores[gameState.currentPlayer] += rotatedPoints.length;

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 'player1' ? 'player2' : 'player1',
        [prev.currentPlayer === 'player1' ? 'player1Shapes' : 'player2Shapes']: newShapes,
        selectedShapeId: null,
        rotation: 0,
        scores: newScores,
      }));
      setHoverPos(null);
    }
  };

  const rotate = () => {
    setGameState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const resetGame = () => {
    setGameState({
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      currentPlayer: 'player1',
      player1Shapes: INITIAL_SHAPES_P1,
      player2Shapes: INITIAL_SHAPES_P2,
      selectedShapeId: null,
      rotation: 0,
      isGameOver: false,
      scores: { player1: 0, player2: 0 },
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif italic font-light tracking-tight">PolyGrid</h1>
          <p className="text-xs uppercase tracking-widest opacity-50">Shape Battle</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowRules(true)}
            className="p-2 rounded-full border border-black/10 hover:bg-black/5 transition-colors"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={resetGame}
            className="p-2 rounded-full border border-black/10 hover:bg-black/5 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
        {/* Player 1 Area */}
        <section className={`flex flex-col gap-4 p-6 rounded-3xl transition-all ${gameState.currentPlayer === 'player1' ? 'bg-blue-50 ring-1 ring-blue-200' : 'opacity-50'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-medium">Player 1</span>
            </div>
            <span className="text-2xl font-serif italic">{gameState.scores.player1}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-2">
            {gameState.player1Shapes.map(shape => (
              <button
                key={shape.id}
                onClick={() => gameState.currentPlayer === 'player1' && setGameState(prev => ({ ...prev, selectedShapeId: shape.id }))}
                className={`aspect-square p-1 rounded-lg border transition-all ${gameState.selectedShapeId === shape.id && gameState.currentPlayer === 'player1' ? 'border-blue-500 bg-blue-100' : 'border-black/5 hover:border-black/20'}`}
              >
                <ShapePreview shape={shape} />
              </button>
            ))}
          </div>
        </section>

        {/* Board Area */}
        <div className="flex flex-col items-center gap-6">
          <div 
            className="relative bg-white p-2 rounded-xl shadow-2xl border border-black/5"
            onMouseLeave={() => setHoverPos(null)}
          >
            <div 
              className="grid gap-px bg-black/10 border border-black/10"
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
            >
              {gameState.board.map((row, y) => 
                row.map((cell, x) => {
                  const isHovered = hoverPos && rotatedPoints.some(p => x === hoverPos.x + p.x && y === hoverPos.y + p.y);
                  const canPlace = hoverPos && isValidMove(rotatedPoints, hoverPos.x, hoverPos.y, gameState.board, gameState.currentPlayer);

                  return (
                    <div
                      key={`${x}-${y}`}
                      className="w-6 h-6 md:w-8 md:h-8 bg-white relative cursor-pointer"
                      onMouseEnter={() => setHoverPos({ x, y })}
                      onClick={() => placeShape(x, y)}
                    >
                      {cell && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0.5 rounded-sm"
                          style={{ backgroundColor: PLAYER_COLORS[cell] }}
                        />
                      )}
                      {isHovered && !cell && (
                        <div 
                          className={`absolute inset-0.5 rounded-sm opacity-40 ${canPlace ? (gameState.currentPlayer === 'player1' ? 'bg-blue-400' : 'bg-red-400') : 'bg-gray-400'}`}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={rotate}
              disabled={!gameState.selectedShapeId}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 disabled:opacity-30 transition-all"
            >
              <RotateCw size={18} />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Player 2 Area */}
        <section className={`flex flex-col gap-4 p-6 rounded-3xl transition-all ${gameState.currentPlayer === 'player2' ? 'bg-red-50 ring-1 ring-red-200' : 'opacity-50'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium">Player 2</span>
            </div>
            <span className="text-2xl font-serif italic">{gameState.scores.player2}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-2">
            {gameState.player2Shapes.map(shape => (
              <button
                key={shape.id}
                onClick={() => gameState.currentPlayer === 'player2' && setGameState(prev => ({ ...prev, selectedShapeId: shape.id }))}
                className={`aspect-square p-1 rounded-lg border transition-all ${gameState.selectedShapeId === shape.id && gameState.currentPlayer === 'player2' ? 'border-red-500 bg-red-100' : 'border-black/5 hover:border-black/20'}`}
              >
                <ShapePreview shape={shape} />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full"
              >
                <X size={20} />
              </button>
              <h2 className="text-3xl font-serif italic mb-6">How to Play</h2>
              <ul className="space-y-4 text-sm leading-relaxed opacity-80">
                <li className="flex gap-3">
                  <span className="font-serif italic text-lg">01.</span>
                  <p>Players take turns placing shapes on the board. Player 1 starts at the top-left corner, Player 2 at the bottom-right.</p>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic text-lg">02.</span>
                  <p>Every new piece must touch at least one corner of your own pieces already on the board.</p>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic text-lg">03.</span>
                  <p>Pieces of the same color cannot touch edge-to-edge.</p>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic text-lg">04.</span>
                  <p>The game ends when no more pieces can be placed. The player with the most squares on the board wins.</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-medium hover:bg-black/80 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-4 text-[10px] uppercase tracking-[0.2em] opacity-30">
        PolyGrid Strategy Board Game &copy; 2026
      </footer>
    </div>
  );
}

function ShapePreview({ shape }: { shape: Shape }) {
  const minX = Math.min(...shape.points.map(p => p.x));
  const maxX = Math.max(...shape.points.map(p => p.x));
  const minY = Math.min(...shape.points.map(p => p.y));
  const maxY = Math.max(...shape.points.map(p => p.y));
  
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const size = Math.max(width, height, 3);

  return (
    <div 
      className="grid gap-0.5 w-full h-full"
      style={{ 
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`
      }}
    >
      {Array(size * size).fill(null).map((_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const isPart = shape.points.some(p => p.x - minX === x && p.y - minY === y);
        return (
          <div 
            key={i} 
            className={`rounded-[1px] ${isPart ? '' : 'bg-transparent'}`}
            style={{ backgroundColor: isPart ? shape.color : 'transparent' }}
          />
        );
      })}
    </div>
  );
}
