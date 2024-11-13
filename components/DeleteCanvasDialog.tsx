import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  canvasName: string;
}

export function DeleteCanvasDialog({ open, onOpenChange, onConfirm, canvasName }: DeleteCanvasDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Canvas</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{canvasName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="dark:bg-red-900 dark:hover:bg-red-800 dark:text-slate-100"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 