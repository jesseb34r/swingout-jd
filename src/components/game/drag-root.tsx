import { ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { DragContext, DragContextValue, DragState } from "./drag-context";

export const DragRoot: ParentComponent = (props) => {
  const [state, setState] = createStore<DragState>({
    isDragging: false,
    dragItem: null,
    currentDropTarget: null,
  });

  const context: DragContextValue = {
    state,
    setIsDragging(isDragging) {
      setState("isDragging", isDragging);
    },
    setDragItem(item) {
      setState("dragItem", item);
    },
    setCurrentDropTarget(dropTarget) {
      setState("currentDropTarget", dropTarget);
    },
  };

  return <DragContext.Provider value={context}>{props.children}</DragContext.Provider>;
};
