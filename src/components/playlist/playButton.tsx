import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";
import { usePlayer } from "@/context/player-provider";
import React from "react";

interface PlayButtonProps {
  playlist?: string;
  index?: number;
  width?: number;
  height?: number;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  playlist,
  index,
  width = 15,
  height = 15,
}) => {
  const {
    paused,
    setPaused,
    playlistName,
    setPlaylistName,
    jumpToSong,
    playlistIndex,
  } = usePlayer();

  console.log("playbutton rerender")
  const handleDifferentPlaylist = () => {
    console.log("setting playlist name", playlist);
    setPlaylistName(playlist);
    if (index !== undefined) {
      jumpToSong(index);
    }
    setPaused(false);
  };

  const handleSamePlaylistDifferentSong = () => {
    console.log("jumping to song", index);
    jumpToSong(index);
    setPaused(false);
  };

  const playSong = () => {
    if (playlist && playlistName !== playlist) {
      handleDifferentPlaylist();
    } else if (index !== playlistIndex) {
      handleSamePlaylistDifferentSong();
    } else {
      setPaused(!paused);
    }
  };

  const renderIcon = () => (
    playlist === playlistName && index === playlistIndex && !paused ? (
      <PauseIcon width={width} height={height} className="text-primary" />
    ) : (
      <PlayIcon width={width} height={height} className="text-primary" />
    )
  );

  return (
    <div
      onClick={playSong}
      role="button"
      tabIndex={0}
      className="hover:cursor-pointer"
    >
      {renderIcon()}
    </div>
  );
};

export default React.memo(PlayButton);