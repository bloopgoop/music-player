import { PlayButton } from "./playButton";
import { MuteButton } from "./muteButton";
import { ShuffleButton } from "./shuffleButton";
import { LoopButton } from "./loopButton";
import { SkipButton } from "./skipButton";
import { PrevButton } from "./prevButton";
import { VolumeSlider } from "./volumeSlider";
import { SongProgress } from "./songProgress";
import { usePlayer } from "@/context/player-provider";
import { Link } from "react-router-dom";
import Image from "@/components/image";

const Player = () => {
  const { playlist, playlistIndex, playlistName, songs } = usePlayer();
  return (
    <div className="flex fixed bottom-0 w-full h-24 gap-3 bg-background items-center justify-center px-2">
      <div className="flex flew-row mr-auto">
        <div className="h-16 w-16 m-2 flex-shrink-0">
          <Image mime={songs[playlistIndex]?.image_mime} buffer={songs[playlistIndex]?.image_buffer} alt="playlist cover" />
        </div>
        <div className="self-center song-info w-2/3 overflow-hidden truncate">
          <Link
            to={
              playlistName === "All songs"
                ? "/playlist/all"
                : `/playlist/${playlistName}`
            }
            className="font-bold hover:underline text-lg"
          >
            {songs[playlistIndex]
              ? songs[playlistIndex].title
              : "Have a good day"}
          </Link>
          <div className="text-sm">
            {songs[playlistIndex]
              ? songs[playlistIndex].artist
              : ""}
          </div>
        </div>
      </div>
      <div className="absolute min-w-60 w-2/4 max-w-[700px] h-full">
        <div className="flex flex-col h-full items-center justify-center relative gap-1 py-4">
          <div className="container h-full flex flex-row items-center justify-center gap-2">
            <ShuffleButton />
            <PrevButton />
            <PlayButton />
            <SkipButton />
            <LoopButton />
          </div>
          <SongProgress />
        </div>
      </div>
      <div className="flex flex-row ml-auto items-center gap-1">
        <MuteButton />
        <VolumeSlider />
      </div>
    </div>
  );
};

export default Player;
