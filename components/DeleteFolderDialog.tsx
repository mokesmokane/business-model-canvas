import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  folderName: string;
  hasContents: boolean;
}

export function DeleteFolderDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  folderName,
  hasContents 
}: DeleteFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Folder</DialogTitle>
          <DialogDescription>
            {hasContents 
              ? `Cannot delete "${folderName}" because it contains canvases or subfolders. Please move or delete the contents first.`
              : `Are you sure you want to delete "${folderName}"? This action cannot be undone.`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            {hasContents ? 'OK' : 'Cancel'}
          </Button>
          {!hasContents && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 