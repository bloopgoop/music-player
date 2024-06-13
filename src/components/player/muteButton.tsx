import {
  SpeakerOffIcon,
  SpeakerQuietIcon,
  SpeakerModerateIcon,
  SpeakerLoudIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/player-provider";

const MuteButton = () => {
  const { sliderVolume, muted, setMuted } = usePlayer();
  const toggleMute = () => {
    setMuted(!muted);
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggleMute}>
      {muted ? (
        <SpeakerOffIcon />
      ) : sliderVolume < 0.2 ? (
        <SpeakerQuietIcon />
      ) : sliderVolume < 0.5 ? (
        <SpeakerModerateIcon />
      ) : (
        <SpeakerLoudIcon />
      )}
    </Button>
  );
};
export { MuteButton };
