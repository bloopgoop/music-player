import { useUi } from "@/context/ui-provider";
import { usePlayer } from "@/context/player-provider";
import { formatImage } from "@/lib/utils";
import Vinyl from "@/components/vinyl";

const Home = () => {
  const { currentSong, currentPlaylist } = useUi();
  const { paused } = usePlayer();

  return (
    <div className="p-3 h-full w-full flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold mb-3">
        {currentSong?.title ? currentSong?.title : currentPlaylist?.name}
      </h1>
      <div
        className="w-1/2 flex-1 flex justify-center items-center"
      >
        <Vinyl
          albumSrc={formatImage(currentSong?.image_mime, currentSong?.image_buffer)}
          paused={paused}
          size={300}
        />
      </div>
      <div>{currentSong?.artist ? currentSong?.artist : "Unkown"}</div>
    </div>
  );
};
export default Home;
