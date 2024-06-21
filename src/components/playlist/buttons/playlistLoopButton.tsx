import { LoopIcon } from "@radix-ui/react-icons";
import { usePlayer, usePlayerDispatch, actionTypes } from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LoopButton = ({
  playlistName,
  firstSongId,
}: {
  playlistName: string;
  firstSongId: number;
}) => {
  const {
    loop,
    toggleLoop,
    currentPlaylistName,
    togglePlay,
    setCurrentPlaylistName,
    clearAutoQueue,
    playSong,
  } = usePlayer();
  const dispatch = usePlayerDispatch();

  const playlistLoop = () => {
    if (playlistName === currentPlaylistName) {
      toggleLoop();
      dispatch({ type: actionTypes.SET_PAUSED, payload: false})
    } else {
      setCurrentPlaylistName(playlistName);
      dispatch({ type: actionTypes.SET_LOOP, payload: true})
      clearAutoQueue();
      playSong(firstSongId);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95"
            onClick={playlistLoop}
          >
            <LoopIcon
              className={
                loop && playlistName === currentPlaylistName
                  ? "text-accent-foreground"
                  : ""
              }
            />
          </TooltipTrigger>
          <TooltipContent >Loop current track</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export default LoopButton;
