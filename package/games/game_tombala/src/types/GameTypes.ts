// Shared game-related types

export interface Player {
  id: string;
  name: string;
  board: number[][];
  marks: boolean[][];
  ready: boolean;
  color: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export type GameStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

export interface GameState {
  status: GameStatus;
  currentNumber: number | null;
  drawnNumbers: number[];
  winner: string | null;
  players: Record<string, Player>;
  messages: Record<string, Message>;
  hostId: string;
  lastDrawTime: number | null;
  countdownStartTime?: number;
  leftGame: boolean;
  roomCode: string;
}

// Map from drawn number to marking player ID
export interface MarkedByPlayer {
  [number: number]: string;
}
