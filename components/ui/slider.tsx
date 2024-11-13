"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { canvasTheme?: string }
>(({ className, canvasTheme, ...props }, ref) => {
  let trackClasses = "";
  let rangeClasses = "";
  let thumbClasses = "";

  if (canvasTheme) {
    // Track classes
    trackClasses = canvasTheme === 'dark' 
      ? "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-800"
      : "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100";

    // Range classes
    rangeClasses = canvasTheme === 'dark'
      ? "absolute h-full bg-gray-50"
      : "absolute h-full bg-gray-900";

    // Thumb classes
    thumbClasses = canvasTheme === 'dark'
      ? "block h-5 w-5 rounded-full border-2 border-gray-50 bg-gray-950 ring-offset-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      : "block h-5 w-5 rounded-full border-2 border-gray-900 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  } else {
    trackClasses = "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800";
    rangeClasses = "absolute h-full bg-gray-900 dark:bg-gray-50";
    thumbClasses = "block h-5 w-5 rounded-full border-2 border-gray-900 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-50 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300";
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={trackClasses}>
        <SliderPrimitive.Range className={rangeClasses} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={thumbClasses} />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
