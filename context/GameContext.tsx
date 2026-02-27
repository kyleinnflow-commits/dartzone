"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { GameState, GameAction, TurnEntry, CricketPlayerState } from "@/types";
import {
  PLAYER_COLORS,
  CRICKET_NUMBERS,
  STARTING_SCORE_501,
  STARTING_SCORE_301,
} from "@/lib/constants";

const initialCricketState = (): Record<number, number> => {
  const marks: Record<number, number> = {};
  for (const n of CRICKET_NUMBERS) {
    marks[n] = 0;
  }
  return marks;
};

const initialState: GameState = {
  mode: "five01",
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  turnHistory: [],
  gameStatus: "setup",
  winner: null,
  scores501: {},
  cricketState: {},
  clockState: {},
  cricketPointsMode: false,
};

function getStartingScore(mode: GameState["mode"]): number {
  return mode === "three01" ? STARTING_SCORE_301 : STARTING_SCORE_501;
}

function allCricketNumbersClosed(state: CricketPlayerState): boolean {
  return CRICKET_NUMBERS.every((n) => (state.marks[n] ?? 0) >= 3);
}

function cricketPointsValue(num: number): number {
  return num === 25 ? 25 : num;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  const n = state.players.length;
  if (n === 0 && action.type !== "SET_PLAYERS" && action.type !== "SET_MODE" && action.type !== "SET_CRICKET_POINTS_MODE" && action.type !== "RESET_GAME") {
    return state;
  }

  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_PLAYERS": {
      const players = action.players.map((p, i) => ({
        ...p,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      }));
      return { ...state, players };
    }

    case "SET_CRICKET_POINTS_MODE":
      return { ...state, cricketPointsMode: action.enabled };

    case "START_GAME": {
      const mode = state.mode;
      const players = state.players;
      const scores501: Record<string, number> = {};
      const cricketState: Record<string, CricketPlayerState> = {};
      const clockState: Record<string, number> = {};

      for (const p of players) {
        if (mode === "five01" || mode === "three01") {
          scores501[p.name] = getStartingScore(mode);
        } else if (mode === "cricket") {
          cricketState[p.name] = {
            marks: { ...initialCricketState() },
            points: 0,
          };
        } else if (mode === "clock") {
          clockState[p.name] = 1;
        }
      }

      return {
        ...state,
        gameStatus: "active",
        currentPlayerIndex: 0,
        round: 1,
        turnHistory: [],
        winner: null,
        scores501,
        cricketState,
        clockState,
      };
    }

    case "SCORE_01": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const remaining = state.scores501[player.name] ?? 0;
      const score = action.score;
      const newRemaining = remaining - score;

      const bust =
        score > remaining || newRemaining < 0 || newRemaining === 1;
      const checkout = newRemaining === 0;

      const nextIndex = (idx + 1) % n;
      const nextRound = nextIndex === 0 ? state.round + 1 : state.round;

      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        previousPlayerIndex: idx,
        previousRound: state.round,
        scoreEntered: score,
        previousRemaining: remaining,
        wasBust: bust,
      };

      if (bust) {
        return {
          ...state,
          turnHistory: [...state.turnHistory, entry],
          currentPlayerIndex: nextIndex,
          round: nextRound,
        };
      }

      const newScores501 = { ...state.scores501, [player.name]: newRemaining };

      if (checkout) {
        return {
          ...state,
          scores501: newScores501,
          turnHistory: [...state.turnHistory, entry],
          winner: player.name,
          gameStatus: "finished",
        };
      }

      return {
        ...state,
        scores501: newScores501,
        turnHistory: [...state.turnHistory, entry],
        currentPlayerIndex: nextIndex,
        round: nextRound,
      };
    }

    case "MARK_CRICKET": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const { number: num, count } = action;
      const cstate = state.cricketState[player.name];
      if (!cstate) return state;

      const prevMarks = cstate.marks[num] ?? 0;
      const newMarks = prevMarks + count;

      let pointsToAdd = 0;
      if (state.cricketPointsMode && newMarks > 3) {
        const opponentsClosed = state.players.some(
          (p) => p.name !== player.name && (state.cricketState[p.name]?.marks[num] ?? 0) >= 3
        );
        if (!opponentsClosed) {
          const scoringMarks = Math.max(0, newMarks - 3) - Math.max(0, prevMarks - 3);
          pointsToAdd = scoringMarks * cricketPointsValue(num);
        }
      }

      const newCricketState = {
        ...state.cricketState,
        [player.name]: {
          marks: { ...cstate.marks, [num]: newMarks },
          points: cstate.points + pointsToAdd,
        },
      };

      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        cricketMarks: [{ number: num, count }],
        pointsScored: pointsToAdd,
      };

      const updatedState = {
        ...state,
        cricketState: newCricketState,
        turnHistory: [...state.turnHistory, entry],
      };

      const newPlayerState = newCricketState[player.name];
      if (allCricketNumbersClosed(newPlayerState)) {
        if (!state.cricketPointsMode) {
          return {
            ...updatedState,
            winner: player.name,
            gameStatus: "finished",
          };
        }
        const myPoints = newPlayerState.points;
        const maxOpponent = Math.max(
          ...state.players
            .filter((p) => p.name !== player.name)
            .map((p) => newCricketState[p.name]?.points ?? 0)
        );
        if (myPoints >= maxOpponent) {
          return {
            ...updatedState,
            winner: player.name,
            gameStatus: "finished",
          };
        }
      }
      return updatedState;
    }

    case "END_TURN": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const nextIndex = (idx + 1) % n;
      const nextRound = nextIndex === 0 ? state.round + 1 : state.round;
      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        previousPlayerIndex: idx,
        previousRound: state.round,
        endTurn: true,
      };
      return {
        ...state,
        turnHistory: [...state.turnHistory, entry],
        currentPlayerIndex: nextIndex,
        round: nextRound,
      };
    }

    case "HIT_CLOCK": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const currentTarget = state.clockState[player.name] ?? 1;
      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        previousPlayerIndex: idx,
        previousRound: state.round,
        targetNumber: currentTarget,
        hit: true,
      };

      if (currentTarget === 21) {
        return {
          ...state,
          turnHistory: [...state.turnHistory, entry],
          winner: player.name,
          gameStatus: "finished",
        };
      }

      const nextIndex = (idx + 1) % n;
      const nextRound = nextIndex === 0 ? state.round + 1 : state.round;
      return {
        ...state,
        clockState: { ...state.clockState, [player.name]: currentTarget + 1 },
        turnHistory: [...state.turnHistory, entry],
        currentPlayerIndex: nextIndex,
        round: nextRound,
      };
    }

    case "MISS_CLOCK": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        previousPlayerIndex: idx,
        previousRound: state.round,
        hit: false,
      };
      const nextIndex = (idx + 1) % n;
      const nextRound = nextIndex === 0 ? state.round + 1 : state.round;
      return {
        ...state,
        turnHistory: [...state.turnHistory, entry],
        currentPlayerIndex: nextIndex,
        round: nextRound,
      };
    }

    case "CLOCK_ADVANCE_TO": {
      if (state.gameStatus !== "active" || n === 0) return state;
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      const currentTarget = state.clockState[player.name] ?? 1;
      const { highestReached } = action;
      if (highestReached < currentTarget || highestReached > 21) return state;
      const entry: TurnEntry = {
        playerName: player.name,
        round: state.round,
        previousPlayerIndex: idx,
        previousRound: state.round,
        targetNumber: currentTarget,
        hit: true,
      };
      if (highestReached === 21) {
        return {
          ...state,
          turnHistory: [...state.turnHistory, entry],
          winner: player.name,
          gameStatus: "finished",
        };
      }
      const nextIndex = (idx + 1) % n;
      const nextRound = nextIndex === 0 ? state.round + 1 : state.round;
      return {
        ...state,
        clockState: { ...state.clockState, [player.name]: highestReached + 1 },
        turnHistory: [...state.turnHistory, entry],
        currentPlayerIndex: nextIndex,
        round: nextRound,
      };
    }

    case "UNDO": {
      const history = state.turnHistory;
      if (history.length === 0) return state;
      const last = history[history.length - 1];
      const rest = history.slice(0, -1);

      if (last.endTurn) {
        return {
          ...state,
          turnHistory: rest,
          currentPlayerIndex: last.previousPlayerIndex ?? 0,
          round: last.previousRound ?? state.round,
        };
      }

      if (last.scoreEntered !== undefined && last.previousRemaining !== undefined) {
        const newScores501 = { ...state.scores501, [last.playerName]: last.previousRemaining };
        return {
          ...state,
          scores501: newScores501,
          turnHistory: rest,
          currentPlayerIndex: last.previousPlayerIndex ?? 0,
          round: last.previousRound ?? state.round,
          winner: null,
          gameStatus: "active",
        };
      }

      if (last.cricketMarks?.length) {
        const cstate = state.cricketState[last.playerName];
        if (!cstate) return state;
        const newMarks = { ...cstate.marks };
        for (const { number: num, count } of last.cricketMarks) {
          newMarks[num] = (newMarks[num] ?? 0) - count;
        }
        const newPoints = cstate.points - (last.pointsScored ?? 0);
        return {
          ...state,
          cricketState: {
            ...state.cricketState,
            [last.playerName]: { marks: newMarks, points: Math.max(0, newPoints) },
          },
          turnHistory: rest,
          winner: state.winner,
          gameStatus: state.gameStatus,
        };
      }

      if (last.hit === true && last.targetNumber !== undefined) {
        const prevTarget = last.targetNumber;
        return {
          ...state,
          clockState: { ...state.clockState, [last.playerName]: prevTarget },
          turnHistory: rest,
          currentPlayerIndex: last.previousPlayerIndex ?? 0,
          round: last.previousRound ?? state.round,
          winner: null,
          gameStatus: "active",
        };
      }

      if (last.hit === false) {
        return {
          ...state,
          turnHistory: rest,
          currentPlayerIndex: last.previousPlayerIndex ?? 0,
          round: last.previousRound ?? state.round,
        };
      }

      return state;
    }

    case "RESET_GAME":
      return { ...initialState };

    case "REMATCH": {
      const mode = state.mode;
      const players = state.players;
      const scores501: Record<string, number> = {};
      const cricketState: Record<string, CricketPlayerState> = {};
      const clockState: Record<string, number> = {};

      for (const p of players) {
        if (mode === "five01" || mode === "three01") {
          scores501[p.name] = getStartingScore(mode);
        } else if (mode === "cricket") {
          cricketState[p.name] = {
            marks: { ...initialCricketState() },
            points: 0,
          };
        } else if (mode === "clock") {
          clockState[p.name] = 1;
        }
      }

      return {
        ...state,
        gameStatus: "active",
        currentPlayerIndex: 0,
        round: 1,
        turnHistory: [],
        winner: null,
        scores501,
        cricketState,
        clockState,
      };
    }

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
