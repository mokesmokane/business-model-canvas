import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle } from "lucide-react"
import { useEffect } from "react"
import { useCanvas } from "@/contexts/CanvasContext"
import { useDiveSuggestions } from "@/contexts/DiveSuggestionsContext"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"

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

  const { formData } = useCanvas();
  const { canvasIdFolderMap } = useCanvasFolders();
  const { startDiveAnalysis } = useDiveSuggestions();
  const handleConfirm = () => {
    console.log('handleConfirm')
    const section = formData?.canvasType.sections.find((s) => s.name === sectionName);
    if (!section) return;
    console.log('starting dive analysis')
    startDiveAnalysis({
      parentCanvas: formData,
      folderId: canvasIdFolderMap.get(formData?.id || "") || "root",
      section: {
        name: section.name,
        placeholder: section.placeholder
      },
      item: itemContent,
    });
    onConfirm();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightCircle className="h-5 w-5" />
            Dive Deeper Into Your Idea
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <div>
              Create a new canvas to explore:
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <div className="font-medium text-foreground line-clamp-2">"{itemContent}"</div>
            </div>
            <div>
              This helps you break down complex ideas into manageable pieces.
            </div>
            <div className="mt-4 space-y-2">
              <div className="font-medium text-foreground">What happens when you dive in:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>AI will analyze your idea and suggest the most relevant canvas types</li>
                <li>The new canvas will be automatically linked to this item</li>
                <li>You can always navigate back and forth between connected canvases</li>
                <li>Your ideas stay organized and connected in a natural way</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2 sm:justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="gap-2"
          >
            <ArrowRightCircle className="h-4 w-4" />
            Dive In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 