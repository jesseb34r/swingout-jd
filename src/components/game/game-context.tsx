/**
 * Game-wide context should include:
 * - card library
 * - cards in zones
 * - players
 */

import { createContext, useContext } from "solid-js";

export type ZoneName = "players" | "battlefield" | "info";

export type GameState = {
  zones: Record<ZoneName, { cardIds: string[] }>;
  cards: Record<string, { id: string; name: string }>;
  players: { main: string; opponent: string };
};

export type GameContextValue = {
  state: GameState;
  addCard: (cardId: string, toZone: ZoneName) => void;
  removeCard: (cardId: string, fromZone: ZoneName) => void;
  moveCard: (cardId: string, fromZone: ZoneName, toZone: ZoneName) => void;
};

export const GameContext = createContext<GameContextValue>();

export const useGameContext = () => {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error("[swingout]: useGameContext must be used witin the game scope");
  }

  return context;
};
