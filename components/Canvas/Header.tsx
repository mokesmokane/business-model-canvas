import React, { ChangeEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyEditDialog } from './CompanyEditDialog'
import { BusinessModelCanvas } from '@/types/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import { useCanvasTheme } from '@/contexts/CanvasThemeContext'
import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header() {
  const { canvasTheme, setCanvasTheme } = useCanvasTheme()
  const { status, formData, updateField, resetForm } = useCanvas();

  useEffect(() => {
    console.log('Header canvas updated:', formData);
  }, [formData]);

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField(event.target.id as keyof BusinessModelCanvas, event.target.value)
  }

  return (
    <div className={`flex items-center justify-between p-4 border-b ${
      canvasTheme === 'light' 
        ? 'bg-white border-gray-200 text-black'
        : 'bg-gray-950 border-gray-800 text-white'
    }`}>
      <div className="flex items-center gap-4">
        <h1 className={`text-3xl font-bold tracking-tight ${
          canvasTheme === 'light' ? 'text-black' : 'text-white'
        }`}>
          The Business Model Canvas
        </h1>
        <div className="flex items-center gap-2">
          <Input 
            canvasTheme={canvasTheme}
            value={formData.companyName}
            className={`max-w-[200px] ${
              canvasTheme === 'light' ? 'text-black' : 'text-white'
            }`}
            readOnly
          />
          <CompanyEditDialog/>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          id="designedFor"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed For"
          value={formData.designedFor}
          onChange={onInputChange}
        />
        <Input
          id="designedBy"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed By"
          value={formData.designedBy}
          onChange={onInputChange}
        />
        <Input
          id="date"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="date"
          placeholder="Date"
          value={formData.date}
          onChange={onInputChange}
        />
        <Input
          id="version"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Version"
          value={formData.version}
          onChange={onInputChange}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}
        >
          {canvasTheme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
} 