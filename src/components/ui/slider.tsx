import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { useRef } from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const rangeRef = useRef<HTMLSpanElement>();
  const thumbRef = useRef<HTMLButtonElement>();

  // Function to toggle the class name
  const toggleAccent = () => {
    if (rangeRef.current) {
      rangeRef.current.classList.toggle("bg-primary");
      rangeRef.current.classList.toggle("bg-accent");
    }
    if (thumbRef.current) {
      thumbRef.current.classList.toggle("block");
      thumbRef.current.classList.toggle("hidden");
    }
  };

  return (
  <SliderPrimitive.Root
    ref={ref}
    onMouseEnter={toggleAccent}
    onMouseLeave={toggleAccent}
    className={cn(
       "relative flex w-full touch-none select-none items-center cursor-pointer",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range ref={rangeRef} className="absolute h-full bg-primary rounded" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb ref={thumbRef} className="hidden h-3 w-3 rounded-full bg-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
  )
});
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
