import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CanvasSection } from "@/types/canvas-sections"
import IconSelector from "@/app/components/IconSelector"
import { useState } from "react"

interface SectionEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: CanvasSection
  onSave: (section: CanvasSection) => void
}

export function SectionEditDialog({ open, onOpenChange, section, onSave }: SectionEditDialogProps) {
  const [editedSection, setEditedSection] = useState<CanvasSection>({ ...section })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={editedSection.name}
              onChange={(e) => setEditedSection({ ...editedSection, name: e.target.value })}
              placeholder="Section Name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Icon</label>
            <IconSelector
              value={editedSection.icon}
              onChange={(icon) => setEditedSection({ ...editedSection, icon })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Placeholder</label>
            <Textarea
              value={editedSection.placeholder}
              onChange={(e) => setEditedSection({ ...editedSection, placeholder: e.target.value })}
              placeholder="Section Placeholder Text"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => {
              onSave(editedSection)
              onOpenChange(false)
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 