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

  console.log("playbutton rerender", currentPlaylistName)
  const handleDifferentPlaylist = () => {
    console.log("setting playlist name", playlist);
    setCurrentPlaylistName(playlist);
    localStorage.setItem("currentPlaylistName", playlist);
    if (songId !== undefined) {
      playSong(songId);
    }
  };

  const handleSamePlaylistDifferentSong = () => {
    console.log("jumping to song", songId);
    playSong(songId);
  };

  const play = () => {
    console.log("in play function", currentPlaylistName)
    if (playlist && currentPlaylistName !== playlist) {
      clearAutoQueue();
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