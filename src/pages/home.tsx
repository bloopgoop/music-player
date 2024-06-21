import { useUi } from "@/context/ui-provider";
import { usePlayer } from "@/context/player-provider";
import { formatImage } from "@/lib/utils";
import Vinyl from "@/components/vinyl";
import Queue from "@/components/queue";
import Lyrics from "@/components/lyrics";

const Home = () => {
  const { currentSong, currentPlaylist } = useUi();
  const { paused } = usePlayer();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="grid lg:grid-cols-[512px_1fr] gap-2 overflow-hidden">
        <div
          className="flex flex-col items-center h-full"
          style={{
            boxShadow: "inset -33px 10px 54px -67px rgba(0,0,0,1)",
          }}
        >
          <h1 className="text-center text-xl font-bold my-3">
            {currentSong?.title ? currentSong?.title : currentPlaylist?.name}
          </h1>
          <div>
            <Vinyl
              albumSrc={formatImage(
                currentSong?.image_mime,
                currentSong?.image_buffer
              )}
              paused={paused}
              size={200}
              className="-translate-x-10"
            />
          </div>
          <div className="w-full text-center pb-3"
          >
            {currentSong?.artist ? currentSong?.artist : "Unknown"}
          </div>
          <h2
            className="text-center text-lg font-bold my-3"
          >
            Lyrics
          </h2>
          <Lyrics lyrics={currentSong?.lyrics} />
        </div>
        <Queue />
      </div>
    </div>
  );
};
export default Home;
