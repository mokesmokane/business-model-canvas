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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightCircle className="h-5 w-5" />
            Dive Deeper
          </DialogTitle>
          <DialogDescription>
            Create a new canvas to explore "{itemContent}" from your {sectionName} section in more detail.
            The new canvas will be linked to this item.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2 sm:justify-end">
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