import { ParentProps } from "solid-js";
import { GameContext, GameContextValue, GameState } from "./game-context";
import { createStore } from "solid-js/store";
import { DragRoot } from "./drag-root";

const testCards: Record<string, { id: string; name: string }> = {
  one: {
    id: "one",
    name: "Lightning Bolt",
  },
  two: {
    id: "two",
    name: "Mountain",
  },
};

export type GameRootProps = ParentProps;

/**
 * Provides the game context at the top level of a game
 *
 * @param zones - sets the zones up in the context to manage card locations
 */
export function GameRoot(props: GameRootProps) {
  const [state, setState] = createStore<GameState>({
    zones: {
      players: { cardIds: new Array<string>() },
      battlefield: { cardIds: ["one", "two"] },
      info: { cardIds: new Array<string>() },
    },
    cards: testCards,
    players: {
      main: "jesseb34r",
      opponent: "kactuus",
    },
  });

  const context: GameContextValue = {
    state,
    addCard(cardId, toZone) {
      setState("zones", toZone, "cardIds", (prevCardIds) => [...prevCardIds, cardId]);
    },
    removeCard(cardId, fromZone) {
      setState("zones", fromZone, "cardIds", (prevCardIds) => prevCardIds.filter((id) => id !== cardId));
    },
    moveCard(cardId, fromZone, toZone) {
      this.removeCard(cardId, fromZone);
      this.addCard(cardId, toZone);
    },
  };

  return (
    <GameContext.Provider value={context}>
      <DragRoot>{props.children}</DragRoot>
    </GameContext.Provider>
  );
}
