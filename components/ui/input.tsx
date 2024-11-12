import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps & { canvasTheme?: string }>(
  ({ className, type, canvasTheme, ...props }, ref) => {
    let classStuff = "";

if (canvasTheme) {
  // The base class string containing both regular and dark-prefixed classes
  const classString = "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-950 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:file:text-gray-50 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300";

  // Split the class string into an array of individual classes
  const classes = classString.split(' ');

  // Filter and map classes based on the canvasTheme value
  classStuff = classes
    .filter(cls => {
      if (cls.startsWith('dark:')) {
        // Include dark-prefixed classes only if canvasTheme is 'dark'
        return canvasTheme === 'dark';
      } else {
        // Always include non-prefixed classes
        return true;
      }
    })
    .map(cls => {
      // Remove 'dark:' prefix from classes
      if (cls.startsWith('dark:')) {
        return cls.substring(5); // Remove 'dark:' prefix
      } else {
        return cls;
      }
    })
    .join(' ');
} else {
  // If canvasTheme is not set, use the class string as is
  classStuff = "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-950 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:file:text-gray-50 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300";
}
    return (
      <input
        type={type}
        className={cn(
          classStuff,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
