import { TrackPreviousIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PrevButton = () => {
  const player = usePlayer();
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="w-8 h-8 p-2 rounded-full hover:bg-card active:translate-y-[1px] active:scale-95"
            onClick={player.previous}
          >
            <TrackPreviousIcon />
          </TooltipTrigger>
          <TooltipContent>Prev / Rewind</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export { PrevButton };
