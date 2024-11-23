import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NestedCanvasFolder } from "@/types/canvas"

interface MoveCanvasDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  canvasName: string
  targetPath: string
}

export function MoveCanvasDialog({
  isOpen,
  onClose,
  onConfirm,
  canvasName,
  targetPath,
}: MoveCanvasDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Canvas</DialogTitle>
          <DialogDescription>
            Are you sure you want to move "{canvasName}" to {targetPath}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 