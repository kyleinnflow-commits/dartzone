import type { GameState, PlayerStats, TurnEntry } from "@/types";
import { CRICKET_NUMBERS } from "./constants";

export function computeStats(state: GameState): PlayerStats[] {
  const { mode, players, turnHistory, cricketState, winner } = state;

  if (mode === "five01" || mode === "three01") {
    return players.map((p) => {
      const entries = turnHistory.filter(
        (e): e is TurnEntry & { scoreEntered: number; previousRemaining: number } =>
          e.playerName === p.name && e.scoreEntered !== undefined && e.previousRemaining !== undefined
      );
      const scoringEntries = entries.filter((e) => !e.wasBust);
      const roundsPlayed = entries.length;
      const totalScore = scoringEntries.reduce((s, e) => s + e.scoreEntered, 0);
      const averagePerRound = roundsPlayed > 0 ? totalScore / roundsPlayed : 0;
      const highestRound =
        scoringEntries.length > 0
          ? Math.max(...scoringEntries.map((e) => e.scoreEntered))
          : 0;
      const checkoutAttempts = entries.filter(
        (e) => e.previousRemaining <= 170 && e.previousRemaining > 0
      ).length;
      const checkoutSuccesses = entries.filter(
        (e) => e.previousRemaining > 0 && e.scoreEntered === e.previousRemaining
      ).length;

      return {
        playerName: p.name,
        roundsPlayed,
        totalScore,
        averagePerRound: Math.round(averagePerRound * 10) / 10,
        highestRound,
        dartsThrown: roundsPlayed * 3,
        checkoutAttempts,
        checkoutSuccesses,
      };
    });
  }

  if (mode === "cricket") {
    return players.map((p) => {
      const cs = cricketState[p.name];
      const marks = cs?.marks ?? {};
      const numbersClosed = CRICKET_NUMBERS.filter((n) => (marks[n] ?? 0) >= 3).length;
      const totalMarks = CRICKET_NUMBERS.reduce((s, n) => s + (marks[n] ?? 0), 0);
      const points = cs?.points ?? 0;
      const roundEntries = turnHistory.filter(
        (e) => e.playerName === p.name && (e.cricketMarks?.length || e.endTurn)
      );
      const roundsPlayed = roundEntries.filter((e) => e.endTurn).length || 1;
      const marksPerRound = roundsPlayed > 0 ? totalMarks / roundsPlayed : 0;

      return {
        playerName: p.name,
        roundsPlayed,
        totalScore: points,
        averagePerRound: Math.round(marksPerRound * 10) / 10,
        highestRound: 0,
        dartsThrown: totalMarks,
        numbersClosed,
        totalPoints: points,
        marksPerRound: Math.round(marksPerRound * 10) / 10,
      };
    });
  }

  if (mode === "clock") {
    const winnerRound = turnHistory.filter((e) => e.hit === true).length;
    return players.map((p) => {
      const hitEntries = turnHistory.filter(
        (e) => e.playerName === p.name && e.hit === true && e.targetNumber !== undefined
      );
      const totalThrows = turnHistory.filter((e) => e.playerName === p.name).length;
      const hits = hitEntries.length;
      const firstAttemptPct = totalThrows > 0 ? (hits / totalThrows) * 100 : 0;
      const roundsToFinish = p.name === winner ? hitEntries.length : 0;

      return {
        playerName: p.name,
        roundsPlayed: totalThrows,
        totalScore: 0,
        averagePerRound: 0,
        highestRound: 0,
        dartsThrown: totalThrows,
        roundsToFinish,
        firstAttemptPct: Math.round(firstAttemptPct),
      };
    });
  }

  return [];
}
