import { ShuffleIcon } from "@radix-ui/react-icons";
import {
  usePlayer,
  usePlayerDispatch,
  actionTypes,
} from "@/context/player-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shuffleArray } from "@/lib/utils";

const ShuffleButton = ({ playlistName }: { playlistName: string }) => {
  const {
    autoQueue,
    shuffle,
    toggleShuffle,
    currentPlaylistName,
    setCurrentPlaylistName,
    clearAutoQueue,
    playSong,
  } = usePlayer();
  const dispatch = usePlayerDispatch();

  async function getSongIds(playlistName: string) {
    return await window.playlists.getSongIds(playlistName);
  }

  const playlistShuffle = () => {
    if (playlistName === currentPlaylistName && shuffle) {
      toggleShuffle();
      dispatch({ type: actionTypes.SET_PAUSED, payload: false });
    } else {
      console.log(autoQueue);
      setCurrentPlaylistName(playlistName);
      getSongIds(playlistName).then((songIds) => {
        shuffleArray(songIds); // Shuffle in place

        dispatch({
          type: actionTypes.SET_SHUFFLE,
          shuffle: true,
          shuffleQueue: songIds.slice(1),
        });
        clearAutoQueue();
        playSong(songIds[0]);
        console.log(autoQueue);
      });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="flex items-center justify-center w-10 h-10 p-2.5 rounded-full hover:bg-muted/50 active:translate-y-[1px] active:scale-95"
            onClick={playlistShuffle}
          >
            <ShuffleIcon
              className={
                shuffle && playlistName === currentPlaylistName
                  ? "text-accent-foreground"
                  : ""
              }
            />
          </TooltipTrigger>
          <TooltipContent>Loop current track</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
export default ShuffleButton;
