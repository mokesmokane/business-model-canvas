import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, Target, Link, Layers, ArrowRight } from 'lucide-react'
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { motion } from "framer-motion"
import DynamicIcon from "@/components/Util/DynamicIcon"

interface MobileConfirmDiveInSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemContent: string
  sectionName: string
  icon: string
}

export function MobileConfirmDiveInSheet({
  isOpen,
  onClose,
  onConfirm,
  itemContent,
  sectionName,
  icon
}: MobileConfirmDiveInSheetProps) {
  const { formData } = useCanvas();
  const { canvasIdFolderMap } = useCanvasFolders();

  const handleConfirm = () => {
    const section = formData?.canvasType.sections.find((s) => s.name === sectionName)
    if (!section) return
    onConfirm()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ArrowRightCircle className="h-6 w-6 text-primary" />
            Dive Deeper
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 pt-4 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="text-lg">
              Create a new canvas to explore:
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <DynamicIcon 
                  name={icon} 
                  className="text-primary h-8 w-8 flex-shrink-0 mt-0" 
                />
                <div className="font-medium text-foreground text-lg">{itemContent}</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
            </div>
            
            <div className="text-base">
              This helps you break down complex ideas into manageable pieces.
            </div>
            
            <div className="space-y-4">
              <div className="font-medium text-foreground text-lg">What happens when you dive in:</div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>AI analyzes your idea and suggests relevant canvas types</div>
                </div>
                <div className="flex items-start gap-3">
                  <Link className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>The new canvas is automatically linked to this item</div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>Navigate easily between connected canvases</div>
                </div>
                <div className="flex items-start gap-3">
                  <Layers className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>Your ideas stay organized and connected naturally</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-2 mt-6">
          <Button
            onClick={handleConfirm}
            className="w-full gap-2"
            size="lg"
          >
            <ArrowRightCircle className="h-4 w-4" />
            Dive In
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 