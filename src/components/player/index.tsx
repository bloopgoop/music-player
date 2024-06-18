import { PlayButton } from "./buttons/playButton";
import { MuteButton } from "./buttons/muteButton";
import { ShuffleButton } from "./buttons/shuffleButton";
import { LoopButton } from "./buttons/loopButton";
import { SkipButton } from "./buttons/skipButton";
import { PrevButton } from "./buttons/prevButton";
import { VolumeSlider } from "./sliders/volumeSlider";
import { SongProgress } from "./sliders/songProgress";
import { Link } from "react-router-dom";
import { useUi } from "@/context/ui-provider";
import Image from "@/components/image";

const Player = () => {
  const { currentSong, currentPlaylist } = useUi();

  return (
    <div className="flex fixed bottom-0 w-full h-24 gap-3 bg-background items-center justify-center px-2">
      <div className="flex flew-row mr-auto">
        <div className="h-16 w-16 m-2 flex-shrink-0">
          <Image mime={currentSong?.image_mime} buffer={currentSong?.image_buffer} alt="playlist cover" />
        </div>
        <div className="self-center song-info w-2/3 overflow-hidden truncate">
          <Link
            to={
              currentPlaylist?.name === "All songs"
                ? "/playlist/all"
                : `/playlist/${currentPlaylist?.name}`
            }
            className="font-bold hover:underline text-lg"
          >
            {currentSong
              ? currentSong.title
              : "Have a good day"}
          </Link>
          <div className="text-sm">
            {currentSong
              ? currentSong.artist
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
