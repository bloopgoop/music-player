import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/player-provider";
import { useState } from "react";
import { set } from "react-hook-form";

const VolumeSlider = () => {
  const player = usePlayer();

  return (
    <Slider
      value={player.muted ? [0] : [player.sliderVolume]}
      step={0.1}
      onValueChange={(i) => {
        player.setSliderVolume(i[0]);
      }}
      onValueCommit={(i) => {
        localStorage.setItem("sliderVolume", String(i[0]));
      }}
      className="w-32 h-1 bg-gray-300 rounded-full"
    />
  );
};
export { VolumeSlider };
