import React, { ChangeEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyEditDialog } from './CompanyEditDialog'
import { BusinessModelCanvas } from '@/types/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import { AIAssistButton } from '../Canvas/AIAssistButton'

interface HeaderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header() {
  const {  status, formData, updateField, resetForm } = useCanvas();

  useEffect(() => {
  console.log('Header canvas updated:', formData);
  }, [formData]);

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField(event.target.id as keyof BusinessModelCanvas, event.target.value)
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">The Business Model Canvas</h1>
        <div className="flex items-center gap-2">
          <Input 
            value={formData.companyName}
            className="max-w-[200px]"
            readOnly
          />
          <CompanyEditDialog/>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          id="designedFor"
          className="max-w-[150px]"
          type="text"
          placeholder="Designed For"
          value={formData.designedFor}
          onChange={onInputChange}
        />
        <Input
          id="designedBy"
          className="max-w-[150px]"
          type="text"
          placeholder="Designed By"
          value={formData.designedBy}
          onChange={onInputChange}
        />
        <Input
          id="date"
          className="max-w-[150px]"
          type="date"
          placeholder="Date"
          value={formData.date}
          onChange={onInputChange}
        />
        <Input
          id="version"
          className="max-w-[150px]"
          type="text"
          placeholder="Version"
          value={formData.version}
          onChange={onInputChange}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetForm}>Reset</Button>
          <Button disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving...' : 'Save'}
          </Button>
          <AIAssistButton />
        </div>
      </div>
    </div>
  )
} 