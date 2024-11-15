import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { AIChatArea } from "@/components/chat/AIChatArea"
import { useState } from "react"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export function MobileAIChat() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0"
        >
          <VisuallyHidden asChild>
            <SheetTitle>AI Assistant</SheetTitle>
          </VisuallyHidden>
          <div className="h-full flex flex-col w-full">
            <AIChatArea onClose={() => setIsOpen(false)}/>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
} 