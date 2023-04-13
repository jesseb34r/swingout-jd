/**
 * styles to move object around
 * functions to update drag context
 * - onMouseDown
 * - onMouseUp
 * - onMouseMove? maybe only for styles
 */

import { createSignal } from "solid-js";
import { DragItem, useDragContext } from "./drag-context";
import { JSX } from "solid-js/web/types/jsx";
import { useGameContext } from "./game-context";

export function createDraggable(itemData: DragItem) {
  const gameContext = useGameContext();
  const dragContext = useDragContext();

  const [position, setPosition] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    dragContext.setIsDragging(false);
    dragContext.setDragItem(null);

    if (dragContext.state.currentDropTarget !== null) {
      gameContext.moveCard(itemData.cardId, itemData.zoneId, dragContext.state.currentDropTarget);
    }

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    dragContext.setIsDragging(true);
    dragContext.setDragItem(itemData);
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { position, handleMouseDown };
}
