import { ShuffleIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePlayer,
  usePlayerDispatch
} from "@/context/player-provider";

const ShuffleButton = () => {
  const dispatch = usePlayerDispatch();
  const { shuffle, shuffleAutoQueue } = usePlayer();

  function handleShuffle() {
    if (shuffle) {
      dispatch({ type: "SET_SHUFFLE", shuffle: false, shuffleQueue: []});
    } else {
      shuffleAutoQueue();
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="w-8 h-8 p-2 rounded-full hover:bg-card active:translate-y-[1px] active:scale-95"
            onClick={handleShuffle}
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
