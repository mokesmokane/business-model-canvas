import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { AIChatArea } from "@/components/chat/AIChatArea"
import { useState } from "react"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useCanvas } from "@/contexts/CanvasContext"

interface MobileAIChatProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileAIChat({ isOpen, onOpenChange }: MobileAIChatProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { canvasTheme } = useCanvas()

  // Use either controlled or uncontrolled state
  const isSheetOpen = isOpen !== undefined ? isOpen : internalOpen
  const handleOpenChange = onOpenChange || setInternalOpen

  return (
    <TooltipProvider>
      <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0"
        >
          <VisuallyHidden asChild>
            <SheetTitle>AI Assistant</SheetTitle>
          </VisuallyHidden>
          <div className="h-full flex flex-col w-full">
            <AIChatArea onClose={() => handleOpenChange(false)}/>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
} 