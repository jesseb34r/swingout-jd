import { useDragContext } from "./drag-context";
import { ZoneName, useGameContext } from "./game-context";

export function createDropTarget(targetId: ZoneName) {
  const dragContext = useDragContext();

  const handleMouseOver = () => {
    dragContext.state.isDragging && dragContext.setCurrentDropTarget(targetId);
  };

  const handleMouseLeave = () => {
    dragContext.state.isDragging && dragContext.setCurrentDropTarget(null);
  };

  return { handleMouseOver, handleMouseExit: handleMouseLeave };
}
