import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { useCanvas } from '@/contexts/CanvasContext'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CanvasLayout, CanvasLayoutDetails } from '@/types/canvas-sections'
import { CanvasType } from '@/types/canvas-sections'
import { useCanvasFolders } from '@/contexts/CanvasFoldersContext'

interface NewCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasType?: CanvasType;
  layout?: CanvasLayout;
  folderId?: string;
}

export function NewCanvasDialog({ open, onOpenChange, canvasType, layout, folderId}: NewCanvasDialogProps) {
  const { createNewCanvas, loadCanvas } = useCanvas();
  const { rootFolderId, setCurrentFolder } = useCanvasFolders()
  const [tempName, setTempName] = React.useState('')
  const [tempDescription, setTempDescription] = React.useState('')
  const [isValid, setIsValid] = React.useState(true)

  const handleSave = async () => {
    if (!tempName.trim()) {
      setIsValid(false)
      return
    }

    try {
      if (!canvasType) {
        return
      }

      const newCanvasId = await createNewCanvas({
        name: tempName.trim(),
        description: tempDescription.trim(),
        canvasType: canvasType,
        layout: layout,
        folderId: folderId || rootFolderId
      })
      
      if (newCanvasId) {
        await loadCanvas(newCanvasId)
        localStorage.setItem('lastCanvasId', newCanvasId)
      }
      
      // Reset form and close dialog
      setTempName('')
      setTempDescription('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create canvas:', error)
      // Optionally add error handling UI here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
      <div className="flex items-center gap-1 px-4">
      <Button
          variant="default"
          className="mt-4"
          disabled={!canvasType}
        >
          Create Canvas
        </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Canvas</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="Name"
              value={tempName}
              onChange={(e) => {
                const trimmed = e.target.value.trim()
                setIsValid(!!trimmed)
                setTempName(e.target.value)
              }}
              className={!isValid ? 'border-red-500' : ''}
              disabled={!canvasType}
            />
            {!isValid && (
              <p className="text-sm text-red-500 mt-1">Name cannot be empty</p>
            )}
          </div>
          <Textarea
            placeholder={`Description

The more detail you provide, the better the AI can understand your situation and the more insightful the advice will be.
              `}
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="min-h-[200px]"
            disabled={!canvasType}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleSave} disabled={!canvasType}>
                Create Canvas
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 