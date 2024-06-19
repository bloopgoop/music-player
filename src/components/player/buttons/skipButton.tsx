import { TrackNextIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SkipButton = () => {
  const { skip } = usePlayer();
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="w-8 h-8 p-2 rounded-full hover:bg-card active:translate-y-[1px] active:scale-95"
            onClick={skip}
          >
            <TrackNextIcon />
          </TooltipTrigger>
          <TooltipContent>Skip / Next</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export { SkipButton };
