import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps & { canvasTheme?: string }>(
  ({ className, canvasTheme, ...props }, ref) => {
    let classStuff = "";

    if (canvasTheme) {
      const classString = "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300";

      const classes = classString.split(' ');

      classStuff = classes
        .filter(cls => {
          if (cls.startsWith('dark:')) {
            return canvasTheme === 'dark';
          } else {
            return true;
          }
        })
        .map(cls => {
          if (cls.startsWith('dark:')) {
            return cls.substring(5);
          } else {
            return cls;
          }
        })
        .join(' ');
    } else {
      classStuff = "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300";
    }

    return (
      <textarea
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
Textarea.displayName = "Textarea"

export { Textarea }
