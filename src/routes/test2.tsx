import {
  For,
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
};

type DragState = {
  elements: Record<string, DraggableState>;
  selectedElementIds: string[];
  dragStartMousePosition: Position;
};

type DragContextValue = {
  state: DragState;
  addElement: (toAdd: DraggableState) => void;
  moveElement: (toMoveId: string, toPosition: Position) => void;
  setDragStartPositions: () => void;
  setDragStartMousePosition: (position: Position) => void;
  selectElement: (toSelectId: string) => void;
  unSelectElement: (toUnSelectId: string) => void;
  handleDrag: (e: MouseEvent) => void;
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

const Draggable: VoidComponent<{ id: string }> = (props) => {
  const dragContext = useDragContext();

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", dragContext.handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    e.preventDefault();
    if (!dragContext.state.selectedElementIds.includes(props.id)) {
      dragContext.selectElement(props.id);
    } else {
      dragContext.unSelectElement(props.id);
    }

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
        "fixed h-40 w-40 rounded bg-blue3": true,
        "border-4 border-orange6":
          !!dragContext.state.selectedElementIds.includes(props.id),
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default function Test2Page() {
  const [state, setState] = createStore<DragState>({
    elements: {},
    selectedElementIds: [],
    dragStartMousePosition: { x: 0, y: 0 },
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
        // setState("elements", id, "dragStartPosition", {
        //   ...state.elements[id].position,
        // });
        setState(
          produce((currentState) => {
            currentState.elements[id].dragStartPosition = {
              ...currentState.elements[id].position,
            };
          })
        );
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
    handleDrag: (e) => {
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
  };

  const [initialPosition, setInitialPosition] = createSignal({ x: 0, y: 0 });
  const [activePosition, setActivePosition] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal<boolean>(false);

  const [zoneRef, setZoneRef] = createSignal<HTMLDivElement>();

  const handleMouseMove = (e: MouseEvent) => {
    setActivePosition({ x: e.clientX, y: e.clientY });
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

    setIsDragging(true);
    setActivePosition({ x: 0, y: 0 });
    setInitialPosition({ x: e.clientX, y: e.clientY });
    setActivePosition({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const dragBoxTop = () => {
    if (initialPosition().y > activePosition().y) {
      return Math.max(activePosition().y, zoneRef()!.getBoundingClientRect().y);
    }
    return Math.max(initialPosition().y, zoneRef()!.getBoundingClientRect().y);
  };

  const dragBoxLeft = () => {
    if (initialPosition().x > activePosition().x) {
      return Math.max(activePosition().x, zoneRef()!.getBoundingClientRect().x);
    }
    return Math.max(initialPosition().x, zoneRef()!.getBoundingClientRect().x);
  };

  const dragBoxHeight = () => {
    if (activePosition().y < zoneRef()!.getBoundingClientRect().y) {
      return initialPosition().y - zoneRef()!.getBoundingClientRect().y;
    }

    if (activePosition().y > zoneRef()!.getBoundingClientRect().bottom) {
      return zoneRef()!.getBoundingClientRect().bottom - initialPosition().y;
    }

    return Math.abs(activePosition().y - initialPosition().y);
  };

  const dragBoxWidth = () => {
    if (activePosition().x < zoneRef()!.getBoundingClientRect().x) {
      return initialPosition().x - zoneRef()!.getBoundingClientRect().x;
    }

    if (activePosition().x > zoneRef()!.getBoundingClientRect().right) {
      return zoneRef()!.getBoundingClientRect().right - initialPosition().x;
    }

    return Math.abs(activePosition().x - initialPosition().x);
  };

  const makeElements = (numToMake: number): string[] => {
    const toReturn: string[] = [];

    for (let i = 1; i <= numToMake; i++) {
      const [ref, setRef] = createSignal<HTMLDivElement>();
      const initialPosition = {
        x: Math.random() * 1000,
        y: Math.random() * 500,
      };
      const id = createUniqueId();

      context.addElement({
        id,
        position: initialPosition,
        dragStartPosition: initialPosition,
      });
      toReturn.push(id);
    }

    return toReturn;
  };

  const startingElementIds = makeElements(2);

  return (
    <main class="flex select-none flex-col text-center">
      <h1 class="mb-2.5 text-6xl font-semibold tracking-wide">Test Page</h1>
      <p class="text-lg text-sand11">Make features work</p>
      <DragContext.Provider value={context}>
        <div
          ref={setZoneRef}
          onMouseDown={handleMouseDown}
          class="m-10 flex h-full items-center justify-center bg-sand5"
        >
          Click and Drag
          <Show when={isDragging()}>
            <div
              style={{
                top: `${dragBoxTop()}px`,
                left: `${dragBoxLeft()}px`,
                width: `${dragBoxWidth()}px`,
                height: `${dragBoxHeight()}px`,
              }}
              class="fixed z-50 overflow-clip border bg-sand11/10"
            ></div>
          </Show>
          <For each={startingElementIds}>
            {(id) => {
              return <Draggable id={id} />;
            }}
          </For>
        </div>
      </DragContext.Provider>
    </main>
  );
}
