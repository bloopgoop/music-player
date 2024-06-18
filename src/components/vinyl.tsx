import vinyl from "@/assets/vinyl.png";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useSettings } from "@/context/settings-provider";

export const Vinyl = ({
  albumSrc,
  paused,
  size = 200,
  ...props
}: {
  albumSrc: string;
  paused: boolean;
  size?: number;
  [key: string]: any;
}) => {
  const settings = useSettings();
  return (
    <div
      id="album"
      className="relative shadow-2xl"
      style={{ height: `${size}px`, width: `${size}px` }}
    >
      <AspectRatio ratio={1 / 1}>
        <img
          id="cover"
          src={albumSrc}
          alt="cover"
          className="absolute top-0 left-0 z-10 rounded"
          height={size}
          width={size}
        />
        <img
          src={vinyl}
          alt="vinyl"
          className={cn(
            "animate-slow-spin absolute top-0 left-1/2 rounded-full z-0",
            paused ? "animate-paused" : "animate-running"
          )}
          height={size}
          width={size}
        />
        <div
          id="reflection"
          className={cn(
            !settings.reflection && "hidden",
            "absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white opacity-30 z-20"
          )}
        />
      </AspectRatio>
    </div>
  );
};
export default Vinyl;
