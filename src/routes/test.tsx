import { Show, VoidComponent, createSignal } from "solid-js";
import { JSX } from "solid-js/web/types/jsx";

const DraggableBox: VoidComponent = () => {
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = createSignal({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = createSignal({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = createSignal(false);

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({
      x: initialPosition().x + (e.clientX - initialMousePosition().x),
      y: initialPosition().y + (e.clientY - initialMousePosition().y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
    setInitialPosition({
      x: e.currentTarget.getBoundingClientRect().x,
      y: e.currentTarget.getBoundingClientRect().y,
    });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        top: `${position().y}px`,
        left: `${position().x}px`,
      }}
      class="fixed h-40 w-40 border-orange6 bg-blue3"
      onMouseDown={handleMouseDown}
    />
  );
};

export default function TestPage() {
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
        <DraggableBox />
        <DraggableBox />
        <DraggableBox />
        <DraggableBox />
      </div>
    </main>
  );
}
