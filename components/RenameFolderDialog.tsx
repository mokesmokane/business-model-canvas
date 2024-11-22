import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newName: string) => void;
  folderName: string;
}

export function RenameFolderDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  folderName 
}: RenameFolderDialogProps) {
  const [newName, setNewName] = useState(folderName)
  const [isValid, setIsValid] = useState(true)

  const handleSubmit = () => {
    if (!newName.trim()) {
      setIsValid(false)
      return
    }
    onConfirm(newName.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for the folder "{folderName}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              setIsValid(!!e.target.value.trim())
            }}
            className={!isValid ? 'border-red-500' : ''}
            placeholder="Folder name"
          />
          {!isValid && (
            <p className="text-sm text-red-500 mt-1">Folder name cannot be empty</p>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 