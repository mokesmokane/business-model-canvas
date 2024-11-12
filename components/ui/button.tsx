import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const getButtonClasses = (canvasTheme?: string) => {
  // Base classes including both light and dark variants
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"

  // Variant classes including both light and dark variants
  const variantClasses = {
    default: "bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
    destructive: "bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
    ghost: "hover:bg-gray-800 hover:text-gray-100 text-gray-400",
    link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
  }

  // Process classes based on canvasTheme
  const processClasses = (classString: string) => {
    return classString.split(' ')
      .filter(cls => {
        if (cls.startsWith('dark:')) {
          return canvasTheme === 'dark';
        }
        return true;
      })
      .map(cls => {
        if (cls.startsWith('dark:')) {
          return cls.substring(5);
        }
        return cls;
      })
      .join(' ');
  }

  // Process all variant classes
  const processedVariants = Object.entries(variantClasses).reduce((acc, [key, value]) => {
    acc[key] = processClasses(value);
    return acc;
  }, {} as Record<string, string>);

  return cva(processClasses(baseClasses), {
    variants: {
      variant: processedVariants,
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<ReturnType<typeof getButtonClasses>> {
  asChild?: boolean
  canvasTheme?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, canvasTheme, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonVariants = getButtonClasses(canvasTheme)
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, getButtonClasses as buttonVariants }
