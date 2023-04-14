import {
  Accessor,
  For,
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

const DraggableBox: VoidComponent<{
  id: string;
  setRef: Setter<HTMLDivElement>;
}> = (props) => {
  const test2Context = useTest2Context();

  const handleMouseUp = () => {
    test2Context.clearSelection();
    document.removeEventListener("mousemove", test2Context.handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    e.preventDefault();
    test2Context.addSelectedElement(props.id);
    test2Context.setDragStartMousePosition(e);
    test2Context.setDragStartPositions();

    document.addEventListener("mousemove", test2Context.handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        top: `${
          test2Context.state.elements.find(
            (element) => element.id === props.id
          )!.position.y
        }px`,
        left: `${
          test2Context.state.elements.find(
            (element) => element.id === props.id
          )!.position.x
        }px`,
      }}
      ref={props.setRef}
      class="fixed h-40 w-40 border-orange6 bg-blue3"
      onMouseDown={handleMouseDown}
    />
  );
};

type DragabbleBoxState = {
  id: string;
  ref: Accessor<HTMLDivElement | undefined>;
  position: { x: number; y: number };
  dragStartPosition: { x: number; y: number };
};

type Test2State = {
  elements: DragabbleBoxState[];
  selectedElementIds: string[];
  dragStartMousePosition: { x: number; y: number };
};

type Test2ContextValue = {
  state: Test2State;
  moveElement: (id: string, toPosition: { x: number; y: number }) => void;
  addElement: (toAdd: DragabbleBoxState) => void;
  addSelectedElement: (id: string) => void;
  clearSelection: () => void;
  setDragStartPositions: () => void;
  setDragStartMousePosition: (e: MouseEvent) => void;
  handleDrag: (e: MouseEvent) => void;
};

const Test2Context = createContext<Test2ContextValue>();

const useTest2Context = () => {
  const context = useContext(Test2Context);

  if (context === undefined) {
    throw new Error(
      "[my-app]: `useTest2Context` must be used within Test2Context scope"
    );
  }

  return context;
};

export default function Test2Page() {
  const [state, setState] = createStore<Test2State>({
    elements: [],
    selectedElementIds: [],
    dragStartMousePosition: { x: 0, y: 0 },
  });
  const context: Test2ContextValue = {
    state,
    moveElement(id, toPosition) {
      if (!state.elements.find((element) => element.id === id)) {
        throw new Error("element id not found");
      }

      setState(
        "elements",
        (element) => element.id === id,
        "position",
        toPosition
      );
    },
    addElement(toAdd) {
      setState(produce((state) => state.elements.push(toAdd)));
    },
    addSelectedElement(id) {
      if (!state.elements.find((element) => element.id === id)) {
        throw new Error("element id not found");
      }
      console.log("adding id " + id);
      setState(produce((state) => state.selectedElementIds.push(id)));
      console.log("current selection is " + state.selectedElementIds);
    },
    clearSelection() {
      setState("selectedElementIds", []);
      console.log("selection cleared");
    },
    setDragStartMousePosition(e) {
      setState("dragStartMousePosition", { x: e.clientX, y: e.clientY });
    },
    setDragStartPositions() {
      state.selectedElementIds.forEach((id) => {
        setState(
          "elements",
          (element) => element.id === id,
          (prev) => {
            prev.dragStartPosition = prev.position;
            return prev;
          }
        );
      });
    },
    handleDrag(e) {
      state.selectedElementIds.forEach((id) => {
        console.log(
          state.elements.find((element) => element.id === id)?.position
        );
        setState(
          "elements",
          (element) => element.id === id,
          "position",
          () => {
            const dragStartPosition = state.elements.find(
              (element) => element.id === id
            )!.dragStartPosition;
            return {
              x:
                dragStartPosition.x +
                (e.clientX - state.dragStartMousePosition.x),
              y:
                dragStartPosition.y +
                (e.clientY - state.dragStartMousePosition.y),
            };
          }
        );
        console.log(
          state.elements.find((element) => element.id === id)?.position
        );
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

  return (
    <main class="flex select-none flex-col text-center">
      <h1 class="mb-2.5 text-6xl font-semibold tracking-wide">Test Page</h1>
      <p class="text-lg text-sand11">Make features work</p>
      <Test2Context.Provider value={context}>
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
          <For each={new Array(5)}>
            {() => {
              const [ref, setRef] = createSignal<HTMLDivElement>();
              const initialPosition = {
                x: Math.random() * 1000,
                y: Math.random() * 500,
              };
              const id = createUniqueId();

              useTest2Context().addElement({
                id,
                ref: ref,
                position: initialPosition,
                dragStartPosition: initialPosition,
              });

              return <DraggableBox id={id} setRef={setRef} />;
            }}
          </For>
        </div>
      </Test2Context.Provider>
    </main>
  );
}
