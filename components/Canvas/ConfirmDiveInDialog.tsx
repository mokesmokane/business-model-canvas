import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, Lightbulb, Target, Link, Layers, ArrowRight } from 'lucide-react'
import { useCanvas } from "@/contexts/CanvasContext"
import { useDiveSuggestions } from "@/contexts/DiveSuggestionsContext"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { motion } from "framer-motion"

interface ConfirmDiveInDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemContent: string
  sectionName: string
}

export function ConfirmDiveInDialog({
  isOpen,
  onClose,
  onConfirm,
  itemContent,
  sectionName
}: ConfirmDiveInDialogProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { formData } = useCanvas();
  const { canvasIdFolderMap } = useCanvasFolders();
  const { startDiveAnalysis } = useDiveSuggestions();
  const handleConfirm = () => {
    console.log('handleConfirm')
    const section = formData?.canvasType.sections.find((s) => s.name === sectionName)
    if (!section) return
    console.log('starting dive analysis')
    startDiveAnalysis({
      parentCanvas: formData,
      folderId: canvasIdFolderMap.get(formData?.id || "") || "root",
      section: {
        name: section.name,
        placeholder: section.placeholder
      },
      item: itemContent,
    })
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ArrowRightCircle className="h-6 w-6 text-primary" />
            Dive Deeper Into Your Idea
          </DialogTitle>
          <DialogDescription className="space-y-6 pt-4">
            <div className="text-lg">
              Create a new canvas to explore:
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 relative overflow-hidden">
              <div className="font-medium text-foreground text-lg relative z-10">"{itemContent}"</div>
              <Lightbulb className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/20 h-16 w-16" />
            </div>
            <div className="text-base">
              This helps you break down complex ideas into manageable pieces.
            </div>
            <div className="space-y-4">
              <div className="font-medium text-foreground text-lg">What happens when you dive in:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-1" />
                  <div>AI analyzes your idea and suggests relevant canvas types</div>
                </div>
                <div className="flex items-start gap-3">
                  <Link className="h-5 w-5 text-primary mt-1" />
                  <div>The new canvas is automatically linked to this item</div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-5 w-5 text-primary mt-1" />
                  <div>Navigate easily between connected canvases</div>
                </div>
                <div className="flex items-start gap-3">
                  <Layers className="h-5 w-5 text-primary mt-1" />
                  <div>Your ideas stay organized and connected naturally</div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <ArrowRight className="absolute top-1/2 -right-8 transform -translate-y-1/2 text-primary" />
                <div className="w-12 h-12 bg-primary/10 rounded-lg absolute -right-16 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2 sm:justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleConfirm}
              className="gap-2"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <ArrowRightCircle className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              Dive In
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

