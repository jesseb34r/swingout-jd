import { createContext, useContext } from "solid-js";
import { ZoneName } from "./game-context";

export type DragItem = {
  cardId: string;
  zoneId: ZoneName;
};

export type DropTargetId = ZoneName;

export type DragState = {
  isDragging: boolean;
  dragItem: DragItem | null;
  currentDropTarget: DropTargetId | null;
};

export type DragContextValue = {
  state: DragState;
  setIsDragging: (isDragging: boolean) => void;
  setDragItem: (item: DragItem | null) => void;
  setCurrentDropTarget: (dropTarget: DropTargetId | null) => void;
};

export const DragContext = createContext<DragContextValue>();

export const useDragContext = () => {
  const context = useContext(DragContext);

  if (context === undefined) {
    throw new Error("[swingout]: useDragContext must be used witin a DragContext scope");
  }

  return context;
};
