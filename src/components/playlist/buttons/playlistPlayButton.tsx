import { Button, ButtonProps } from "@/components/ui/button";
import { usePlayer } from "@/context/player-provider";
import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";

interface PlaylistPlayButtonProps extends ButtonProps {
  playlistName: string;
  firstSongId: number;
  width?: number;
  height?: number;
}

const PlaylistPlayButton: React.FC<PlaylistPlayButtonProps> = ({
  playlistName,
  firstSongId,
  ...props
}) => {
  const {
    paused,
    togglePlay,
    currentPlaylistName,
    setCurrentPlaylistName,
    playSong,
    clearHistory,
    clearAutoQueue,
  } = usePlayer();

  const playPlaylist = () => {
    if (playlistName === currentPlaylistName) {
      togglePlay();
      return;
    } else {
      setCurrentPlaylistName(playlistName);
      clearAutoQueue();
      playSong(firstSongId);
    }
  };

  return (
    <Button onClick={playPlaylist} {...props} disabled={!firstSongId}>
      {playlistName === currentPlaylistName && !paused ? (
        <PauseIcon width={20} height={20} className="text-primary" />
      ) : (
        <PlayIcon width={20} height={20} className="text-primary" />
      )}
    </Button>
  );
};
export default PlaylistPlayButton
