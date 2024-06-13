import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { usePlayer } from "@/context/player-provider";
import { formatTime } from "@/lib/utils";

const SongProgress = () => {
  const { player, duration } = usePlayer();
  const [elapsed, setElapsed] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState([0]);

  if (player.readyState === 0)
    return (
      <div className="flex flex-row w-full gap-1">
        0:00
        <Slider disabled />
        {duration ? formatTime(duration) : "0:00"}
      </div>
    );

  player.ontimeupdate = () => {
    setElapsed(player.currentTime);
  }
  return (
    <div className="flex flex-row w-full gap-1">
      {isScrubbing
        ? formatTime((scrubValue[0] / 100) * duration)
        : formatTime(elapsed)}
      <Slider
        step={0.1}
        defaultValue={[0]}
        value={isScrubbing ? scrubValue : [(elapsed / duration) * 100]}
        onValueChange={(i) => {
          setIsScrubbing(true);
          setScrubValue(i);
        }}
        onValueCommit={(i) => {
          player.currentTime = (i[0] / 100) * duration;
          setElapsed((i[0] / 100) * duration);
          setIsScrubbing(false);
        }}
      />
      {formatTime(duration)}
    </div>
  );
};
export { SongProgress };
