import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import React from "react";

interface PlayButtonProps {
  playlist?: string;
  songId?: number;
  width?: number;
  height?: number;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  playlist,
  songId,
  width = 15,
  height = 15,
}) => {
  const {
    paused,
    togglePlay,
    currentPlaylistName,
    currentSongId,
    setCurrentPlaylistName,
    playSong,
    clearAutoQueue,
  } = usePlayer();

  const handleDifferentPlaylist = () => {
    setCurrentPlaylistName(playlist);
    clearAutoQueue();
    if (songId !== undefined) {
      playSong(songId);
    }
  };

  const handleSamePlaylistDifferentSong = () => {
    clearAutoQueue();
    playSong(songId);
  };

  const play = () => {
    if (playlist && currentPlaylistName !== playlist) {
      handleDifferentPlaylist();
    } else if (songId !== currentSongId) {
      handleSamePlaylistDifferentSong();
    } else {
      togglePlay();
    }
  };

  const renderIcon = () => (
    playlist === currentPlaylistName && songId === currentSongId && !paused ? (
      <PauseIcon width={width} height={height} className="text-primary" />
    ) : (
      <PlayIcon width={width} height={height} className="text-primary" />
    )
  );

  return (
    <div
      onClick={() => play()}
      role="button"
      tabIndex={0}
      className="hover:cursor-pointer"
    >
      {renderIcon()}
    </div>
  );
};

export default React.memo(PlayButton);