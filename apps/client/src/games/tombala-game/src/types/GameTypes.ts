// GameTypes: oyun durumunu ve ilgili veri modellerini tanımlayan tipler

// Player: oyundaki her bir oyuncunun kimlik bilgisi ve kart durumunu tutar
export interface Player {
  id: string;
  name: string;
  board: number[][];
  marks: boolean[][];
  ready: boolean;
  color: string;
}

// Message: sohbet mesajlarının yapısını ve meta verilerini tanımlar
export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

// GameStatus: oyunun mevcut aşamasını temsil eden durum birleşeni
export type GameStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

// GameState: oyunun genel durum bilgisini içeren nesne yapısı
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

// MarkedByPlayer: çekilen numaraların hangi oyuncu tarafından işaretlendiğini haritalar
export interface MarkedByPlayer {
  [number: number]: string;
}
