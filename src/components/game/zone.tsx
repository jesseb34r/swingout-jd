import { Component, ComponentProps, For, createContext, splitProps, useContext } from "solid-js";
import { ZoneName, useGameContext } from "./game-context";
import { GameCard } from "./game-card";
import { createDropTarget } from "./createDropTarget";

type ZoneContextValue = {
  id: ZoneName;
};

const ZoneContext = createContext<ZoneContextValue>();

export const useZoneContext = () => {
  const context = useContext(ZoneContext);

  if (context === undefined) {
    throw new Error("[swingout]: useZoneContext must be used within a zone component scope");
  }

  return context;
};

export type ZoneOptions = {
  id: ZoneName;
};
type ZoneProps = ZoneOptions & ComponentProps<"div">;

export const Zone: Component<ZoneProps> = (props) => {
  const gameContext = useGameContext();

  const [local, others] = splitProps(props, ["id"]);

  const drop = createDropTarget(local.id);

  return (
    <ZoneContext.Provider value={{ id: props.id }}>
      <div onMouseOver={drop.handleMouseOver} onMouseLeave={drop.handleMouseExit} {...others}>
        <For each={gameContext.state.zones[local.id].cardIds}>{(cardId) => <GameCard id={cardId} />}</For>
      </div>
    </ZoneContext.Provider>
  );
};
