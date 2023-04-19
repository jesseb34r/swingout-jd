import {
  Accessor,
  ComponentProps,
  For,
  ParentComponent,
  Setter,
  Show,
  VoidComponent,
  createContext,
  createSignal,
  createUniqueId,
  useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { JSX } from "solid-js/web/types/jsx";

type Position = { x: number; y: number };

type DraggableState = {
  id: string;
  position: Position;
  dragStartPosition: Position;
  ref: Accessor<HTMLDivElement | undefined>;
};

type DragState = {
  elements: Record<string, DraggableState>;
  selectedElementIds: string[];
  dragStartMousePosition: Position;
  isDragging: boolean;
};

type DragContextValue = {
  state: DragState;
  addElement: (toAdd: DraggableState) => void;
  moveElement: (toMoveId: string, toPosition: Position) => void;
  setDragStartPositions: () => void;
  setDragStartMousePosition: (position: Position) => void;
  selectElement: (toSelectId: string) => void;
  unSelectElement: (toUnSelectId: string) => void;
  setSelection: (newSelection: string[]) => void;
  clearSelection: () => void;
  handleDrag: (e: MouseEvent) => void;
  setIsDragging: (isDragging: boolean) => void;
};

const DragContext = createContext<DragContextValue>();

const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error(
      "[drag-context]: useDragContext must be used within a DragContext provider"
    );
  }
  return context;
};

const Draggable: VoidComponent<{
  id: string;
  setRef: Setter<HTMLDivElement>;
}> = (props) => {
  const dragContext = useDragContext();

  const handleMouseUp = () => {
    if (dragContext.state.isDragging) {
      dragContext.setIsDragging(false);
      dragContext.clearSelection();
    }

    document.removeEventListener("mousemove", dragContext.handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    e.preventDefault();

    !dragContext.state.selectedElementIds.includes(props.id) &&
      dragContext.selectElement(props.id);
    dragContext.setDragStartMousePosition({ x: e.clientX, y: e.clientY });
    dragContext.setDragStartPositions();

    document.addEventListener("mousemove", dragContext.handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        top: `${dragContext.state.elements[props.id].position.y}px`,
        left: `${dragContext.state.elements[props.id].position.x}px`,
      }}
      classList={{
        "fixed h-40 w-40 rounded bg-blue3 border-4 border-blue5 ": true,
        "border-orange9": !!dragContext.state.selectedElementIds.includes(
          props.id
        ),
      }}
      onMouseDown={handleMouseDown}
      ref={props.setRef}
    />
  );
};

const DragSelectZone: ParentComponent<ComponentProps<"div">> = (props) => {
  const [zoneRef, setZoneRef] = createSignal<HTMLDivElement>();
  const [selectionRef, setSelectionRef] = createSignal<HTMLDivElement>();
  const [dragStartMousePosition, setDragStartMousePosition] = createSignal({
    x: 0,
    y: 0,
  });
  const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const dragContext = useDragContext();

  const checkIntersection = (): string[] => {
    let toReturn = [] as string[];
    Object.keys(dragContext.state.elements).forEach((elementId) => {
      const elementRect = dragContext.state.elements[elementId]
        .ref()
        ?.getBoundingClientRect();
      const selectionRect = selectionRef()?.getBoundingClientRect();

      if (!elementRect) {
        console.log("undefined element rect");
        return;
      }

      if (!selectionRect) {
        console.log("undefined selection rect");
        return;
      }

      if (
        selectionRect.x < elementRect.x + elementRect.width &&
        selectionRect.x + selectionRect.width > elementRect.x &&
        selectionRect.y < elementRect.y + elementRect.height &&
        selectionRect.y + selectionRect.height > elementRect.y
      ) {
        toReturn.push(elementId);
      }
    });

    return toReturn;
  };

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    dragContext.setSelection(checkIntersection());
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }

    dragContext.clearSelection();

    setIsDragging(true);
    setDragStartMousePosition({ x: e.clientX, y: e.clientY });
    setMousePosition({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const selectBoxDimensions = {
    top: () => {
      if (dragStartMousePosition().y > mousePosition().y) {
        return Math.max(
          mousePosition().y,
          zoneRef()!.getBoundingClientRect().y
        );
      }
      return Math.max(
        dragStartMousePosition().y,
        zoneRef()!.getBoundingClientRect().y
      );
    },
    left: () => {
      if (dragStartMousePosition().x > mousePosition().x) {
        return Math.max(
          mousePosition().x,
          zoneRef()!.getBoundingClientRect().x
        );
      }
      return Math.max(
        dragStartMousePosition().x,
        zoneRef()!.getBoundingClientRect().x
      );
    },
    height: () => {
      if (mousePosition().y < zoneRef()!.getBoundingClientRect().y) {
        return (
          dragStartMousePosition().y - zoneRef()!.getBoundingClientRect().y
        );
      }

      if (mousePosition().y > zoneRef()!.getBoundingClientRect().bottom) {
        return (
          zoneRef()!.getBoundingClientRect().bottom - dragStartMousePosition().y
        );
      }

      return Math.abs(mousePosition().y - dragStartMousePosition().y);
    },
    width: () => {
      if (mousePosition().x < zoneRef()!.getBoundingClientRect().x) {
        return (
          dragStartMousePosition().x - zoneRef()!.getBoundingClientRect().x
        );
      }

      if (mousePosition().x > zoneRef()!.getBoundingClientRect().right) {
        return (
          zoneRef()!.getBoundingClientRect().right - dragStartMousePosition().x
        );
      }

      return Math.abs(mousePosition().x - dragStartMousePosition().x);
    },
  };

  return (
    <div ref={setZoneRef} onMouseDown={handleMouseDown} {...props}>
      <Show when={isDragging()}>
        <div
          ref={setSelectionRef}
          style={{
            top: `${selectBoxDimensions.top()}px`,
            left: `${selectBoxDimensions.left()}px`,
            width: `${selectBoxDimensions.width()}px`,
            height: `${selectBoxDimensions.height()}px`,
          }}
          class="fixed z-50 overflow-clip border bg-sand11/10"
        ></div>
      </Show>
      {props.children}
    </div>
  );
};

export default function Test2Page() {
  const [state, setState] = createStore<DragState>({
    elements: {},
    selectedElementIds: [],
    dragStartMousePosition: { x: 0, y: 0 },
    isDragging: false,
  });

  const context: DragContextValue = {
    state,
    addElement: (toAdd) => {
      setState("elements", toAdd.id, toAdd);
    },
    moveElement: (toMoveId, toPosition) => {
      setState("elements", toMoveId, "position", toPosition);
    },
    setDragStartPositions: () => {
      state.selectedElementIds.forEach((id) => {
        setState("elements", id, (prev) => {
          prev.dragStartPosition = { ...prev.position };
          return prev;
        });
      });
    },
    setDragStartMousePosition: (position) => {
      setState("dragStartMousePosition", position);
    },
    selectElement: (toSelect) => {
      if (state.selectedElementIds.includes(toSelect)) {
        throw new Error(
          "[drag-context]: cannot select an element that is already selected"
        );
      }
      setState(
        produce((currentState) =>
          currentState.selectedElementIds.push(toSelect)
        )
      );
    },
    unSelectElement: (toUnselect) => {
      if (!state.selectedElementIds.includes(toUnselect)) {
        throw new Error(
          "[drag-context]: cannot unselect an element that is not selected"
        );
      }
      setState(
        produce(
          (currentState) =>
            (currentState.selectedElementIds =
              currentState.selectedElementIds.filter((id) => id !== toUnselect))
        )
      );
    },
    setSelection: (newSelection) => {
      setState("selectedElementIds", newSelection);
    },
    clearSelection: () => {
      setState("selectedElementIds", []);
    },
    handleDrag: (e) => {
      if (!state.isDragging) {
        context.setIsDragging(true);
      }

      state.selectedElementIds.forEach((id) => {
        setState("elements", id, "position", {
          x:
            state.elements[id].dragStartPosition.x +
            (e.clientX - state.dragStartMousePosition.x),
          y:
            state.elements[id].dragStartPosition.y +
            (e.clientY - state.dragStartMousePosition.y),
        });
      });
    },
    setIsDragging: (isDragging) => {
      setState("isDragging", isDragging);
    },
  };

  const makeElements = (
    numToMake: number
  ): { id: string; setRef: Setter<HTMLDivElement> }[] => {
    const toReturn: { id: string; setRef: Setter<HTMLDivElement> }[] = [];

    for (let i = 1; i <= numToMake; i++) {
      const [ref, setRef] = createSignal<HTMLDivElement>();
      const initialPosition = {
        x: Math.random() * 1000,
        y: Math.random() * 500,
      };
      const id = createUniqueId();

      context.addElement({
        id,
        ref,
        position: { ...initialPosition },
        dragStartPosition: { ...initialPosition },
      });
      toReturn.push({ id, setRef });
    }

    return toReturn;
  };

  const startingElements = makeElements(2);

  return (
    <main class="flex select-none flex-col text-center">
      <h1 class="mb-2.5 text-6xl font-semibold tracking-wide">Test Page</h1>
      <p class="text-lg text-sand11">Make features work</p>
      <DragContext.Provider value={context}>
        <DragSelectZone class="m-10 flex h-full items-center justify-center bg-sand5">
          Click and Drag
          <For each={startingElements}>
            {(element) => {
              return <Draggable setRef={element.setRef} id={element.id} />;
            }}
          </For>
        </DragSelectZone>
      </DragContext.Provider>
    </main>
  );
}
