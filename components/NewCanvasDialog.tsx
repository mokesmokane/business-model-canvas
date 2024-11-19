import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { useCanvas } from '@/contexts/CanvasContext'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NewCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasType?: string;
  layout?: string;
}

export function NewCanvasDialog({ open, onOpenChange, canvasType, layout }: NewCanvasDialogProps) {
  const { createNewCanvas, loadCanvas } = useCanvas();
  const [tempName, setTempName] = React.useState('')
  const [tempDescription, setTempDescription] = React.useState('')
  const [isValid, setIsValid] = React.useState(true)

  const handleSave = async () => {
    if (!tempName.trim()) {
      setIsValid(false)
      return
    }

    try {
      console.log('Creating new canvas with:', {
        name: tempName.trim(),
        description: tempDescription.trim(),
        canvasType: canvasType || '',
        layout: layout || ''
      });

      const newCanvasId = await createNewCanvas({
        name: tempName.trim(),
        description: tempDescription.trim(),
        canvasType: canvasType || '',
        layout: layout || ''
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
              placeholder="Business Name"
              value={tempName}
              onChange={(e) => {
                const trimmed = e.target.value.trim()
                setIsValid(!!trimmed)
                setTempName(e.target.value)
              }}
              className={!isValid ? 'border-red-500' : ''}
            />
            {!isValid && (
              <p className="text-sm text-red-500 mt-1">Business name cannot be empty</p>
            )}
          </div>
          <Textarea
            placeholder={`Business description

The more detail you provide, the better the AI can understand your business and the more insightful the advice will be.
              `}
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="min-h-[200px]"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleSave}>
                Create Canvas
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 