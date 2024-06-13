import { LoopIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LoopButton = () => {
  const { loop, setLoop } = usePlayer();
  const toggleLoop = () => {
    setLoop(!loop);
    localStorage.setItem("loop", JSON.stringify(!loop));
  };
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="w-8 h-8 p-2 rounded-full hover:bg-card active:translate-y-[1px] active:scale-95"
            onClick={toggleLoop}
          >
            <LoopIcon className={loop ? "text-accent-foreground" : ""} />
          </TooltipTrigger>
          <TooltipContent>Loop current track</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export { LoopButton };
