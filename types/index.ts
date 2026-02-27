export type GameMode = "five01" | "three01" | "cricket" | "clock";

export interface Player {
  name: string;
  color: string;
}

export interface TurnEntry {
  playerName: string;
  round: number;
  previousPlayerIndex?: number;
  previousRound?: number;
  scoreEntered?: number;
  previousRemaining?: number;
  wasBust?: boolean;
  cricketMarks?: { number: number; count: number }[];
  pointsScored?: number;
  targetNumber?: number;
  hit?: boolean;
  endTurn?: boolean;
}

export interface CricketPlayerState {
  marks: Record<number, number>;
  points: number;
}

export interface GameSummary {
  mode: GameMode;
  players: Player[];
  winner: string;
  date: string;
  stats: PlayerStats[];
}

export interface PlayerStats {
  playerName: string;
  roundsPlayed: number;
  totalScore: number;
  averagePerRound: number;
  highestRound: number;
  dartsThrown: number;
  checkoutAttempts?: number;
  checkoutSuccesses?: number;
  numbersClosed?: number;
  totalPoints?: number;
  marksPerRound?: number;
  roundsToFinish?: number;
  firstAttemptPct?: number;
}

export type GameStatus = "setup" | "active" | "finished";

export interface GameState {
  mode: GameMode;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  turnHistory: TurnEntry[];
  gameStatus: GameStatus;
  winner: string | null;
  scores501: Record<string, number>;
  cricketState: Record<string, CricketPlayerState>;
  clockState: Record<string, number>;
  cricketPointsMode: boolean;
}

export type GameAction =
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_PLAYERS"; players: Player[] }
  | { type: "SET_CRICKET_POINTS_MODE"; enabled: boolean }
  | { type: "START_GAME" }
  | { type: "SCORE_01"; score: number }
  | { type: "MARK_CRICKET"; number: number; count: number }
  | { type: "END_TURN" }
  | { type: "HIT_CLOCK" }
  | { type: "MISS_CLOCK" }
  | { type: "UNDO" }
  | { type: "RESET_GAME" }
  | { type: "REMATCH" };
