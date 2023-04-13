import { GameRoot } from "~/components/game/game-root";
import { Zone } from "~/components/game/zone";

export default function GamePage() {
  return (
    <main class="grid h-full [grid-template:'players_battlefield_info'_1fr_/_auto_1fr_auto]">
      <GameRoot>
        <Zone
          class="bg-amber3 flex min-w-[18rem] flex-col [grid-area:players]"
          id="players"
        />
        <Zone class="bg-sand1 flex [grid-area:battlefield]" id="battlefield" />
        <Zone
          class="bg-blue3 flex min-w-[18rem] flex-col [grid-area:info]"
          id="info"
        />
      </GameRoot>
    </main>
  );
}
