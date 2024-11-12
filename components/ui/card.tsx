import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { canvasTheme?: string }
>(({ className, canvasTheme, ...props }, ref) => {
  let classStuff = "";
  
  if (canvasTheme) {
    const classString = canvasTheme === 'dark' 
      ? "rounded-lg border border-gray-800 bg-gray-950 text-gray-50 shadow-sm"
      : "rounded-lg border border-gray-100 bg-white text-gray-950 shadow-sm";
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
    classStuff = "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";
  }

  return (
    <div
      ref={ref}
      className={cn(classStuff, className)}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { canvasTheme?: string }
>(({ className, canvasTheme, ...props }, ref) => {
  let classStuff = "";
  
  if (canvasTheme) {
    const classString = "text-sm text-gray-500 dark:text-gray-400";
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
    classStuff = "text-sm text-gray-500 dark:text-gray-400";
  }

  return (
    <div
      ref={ref}
      className={cn(classStuff, className)}
      {...props}
    />
  );
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
