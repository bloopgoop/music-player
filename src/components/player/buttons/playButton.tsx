import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/player-provider";

const PlayButton = () => {
  const { togglePlay, paused } = usePlayer();

  return (
    <Button
      variant="default"
      size="icon"
      onClick={togglePlay}
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
