import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { useCanvas } from '@/contexts/CanvasContext'
import { Plus } from 'lucide-react'

export function NewCanvasDialog() {
  const { createNewCanvas } = useCanvas();
  const [open, setOpen] = React.useState(false)
  const [tempName, setTempName] = React.useState('')
  const [tempDescription, setTempDescription] = React.useState('')
  const [isValid, setIsValid] = React.useState(true)

  const handleSave = async () => {
    if (!tempName.trim()) {
      setIsValid(false)
      return
    }

    try {
      await createNewCanvas({
        name: tempName.trim(),
        description: tempDescription.trim()
      })
      
      // Reset form and close dialog
      setTempName('')
      setTempDescription('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create canvas:', error)
      // Optionally add error handling UI here
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start pl-8">
            <Plus className="h-4 w-4" />
            New Canvas
          </Button>
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
            placeholder="Business Description"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="min-h-[100px]"
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