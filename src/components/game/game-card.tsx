import { Component, For } from "solid-js";
import { ZoneName, useGameContext } from "./game-context";
import { useZoneContext } from "./zone";
import { createDraggable } from "./createDraggable";
import { useDragContext } from "./drag-context";

export const GameCard: Component<{ id: string }> = (props) => {
  const gameContext = useGameContext();
  const zoneContext = useZoneContext();
  const dragContext = useDragContext();

  const drag = createDraggable({ cardId: props.id, zoneId: zoneContext.id });

  return (
    <div
      style={
        dragContext.state.dragItem?.cardId === props.id
          ? {
              position: "fixed",
              left: `${drag.position().x}px`,
              top: `${drag.position().y}px`,
              opacity: "80%",
              transform: "translate(-50%, -50%)",
              "pointer-events": "none",
            }
          : undefined
      }
      class="flex h-[21rem] w-[14rem] select-none flex-col items-center gap-2.5 rounded-md border border-sand6 bg-sand3"
      onMouseDown={drag.handleMouseDown}
    >
      <h2 class="font-semibold">{gameContext.state.cards[props.id].name}</h2>
      <For
        each={Object.keys(gameContext.state.zones).filter(
          (zoneName) => zoneName !== zoneContext.id
        )}
      >
        {(zoneName) => (
          <button
            onClick={() =>
              gameContext.moveCard(
                props.id,
                zoneContext.id,
                zoneName as ZoneName
              )
            }
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >{`Move to ${zoneName}`}</button>
        )}
      </For>
    </div>
  );
};
