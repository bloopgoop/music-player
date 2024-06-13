import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import Placeholder from "@/assets/placeholder.png";

const Image = ({
  alt,
  mime,
  buffer,
  className,
}: {
  alt: string | null;
  mime?: string | null;
  buffer?: string | null;
  className?: string;
}) => {
  return (
    <AspectRatio ratio={1 / 1}>
      {buffer ? (
        <img
          src={`data:${mime};base64,${buffer}`}
          alt={alt}
          className={cn("rounded-lg", className)}
        />
      ) : (
        <img
          src={Placeholder}
          alt="placeholder"
          className={cn("rounded-lg", className)}
        />
      )}
    </AspectRatio>
  );
};
export default Image;