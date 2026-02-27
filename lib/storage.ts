const PLAYERS_KEY = "dartzone_players";

export function loadSavedPlayers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, 6);
  } catch {
    return [];
  }
}

export function savePlayers(names: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const toSave = names.filter(Boolean).map((n) => n.trim()).slice(0, 6);
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}
