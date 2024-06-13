import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/player-provider";

const PlayButton = () => {
  const { paused, setPaused, playlistName, setPlaylistName } = usePlayer();

  const togglePause = () => {
    setPaused(!paused);
  };

  return (
    <Button
      variant="default"
      size="icon"
      onClick={togglePause}
      className="hover:scale-105"
    >
      {paused ? (
        <PlayIcon width={20} height={20} className="text-primary" />
      ) : (
        <PauseIcon width={20} height={20} className="text-primary" />
      )}
    </Button>
  );
};
export { PlayButton };
