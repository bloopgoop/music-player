import { ShuffleIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ShuffleButton = () => {
  const { shuffle, setShuffle } = usePlayer();
  function toggleShuffle() {
    setShuffle(!shuffle);
    localStorage.setItem("shuffle", JSON.stringify(!shuffle));
  }
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="w-8 h-8 p-2 rounded-full hover:bg-card active:translate-y-[1px] active:scale-95"
            onClick={toggleShuffle}
          >
            <ShuffleIcon className={shuffle ? "text-accent-foreground" : ""}/>
          </TooltipTrigger>
          <TooltipContent>Shuffle current track</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export { ShuffleButton };
