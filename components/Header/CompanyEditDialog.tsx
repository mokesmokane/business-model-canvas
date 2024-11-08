import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Pencil } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { useCanvas } from '@/contexts/CanvasContext'

export function CompanyEditDialog() {
  const { formData, updateField } = useCanvas();
  const [tempName, setTempName] = React.useState(formData.companyName || '')
  const [tempDescription, setTempDescription] = React.useState(formData.companyDescription || '')
  const [isValid, setIsValid] = React.useState(true)

  const handleSave = () => {
    if (!tempName.trim()) {
      setIsValid(false)
      return
    }
    updateField('companyName', tempName)
    updateField('companyDescription', tempDescription)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempName(formData.companyName || '')
      setTempDescription(formData.companyDescription || '')
      setIsValid(true)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="Company Name"
              value={tempName}
              onChange={(e) => {
                setTempName(e.target.value)
                setIsValid(!!e.target.value.trim())
              }}
              className={!isValid ? 'border-red-500' : ''}
            />
            {!isValid && (
              <p className="text-sm text-red-500 mt-1">Company name cannot be empty</p>
            )}
          </div>
          <Textarea
            placeholder="Company Description"
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 