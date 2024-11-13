import React, { ChangeEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyEditDialog } from './CompanyEditDialog'
import { BusinessModelCanvas } from '@/types/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ThemeToggleButton = () => {
  const { canvasTheme, setCanvasTheme } = useCanvas()
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}
      className={`${
        canvasTheme === 'light'
          ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
          : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-gray-100'
      }`}
    >
      {canvasTheme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function Header() {
  const { canvasTheme, formData, updateField } = useCanvas();

  useEffect(() => {
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
          <div className={`${!formData.companyName || !formData.companyDescription ? 
            'animate-pulse ring-2 ring-blue-500 rounded-md ring-opacity-75 shadow-lg shadow-blue-500/50' : ''}`}>
            <CompanyEditDialog/>
          </div>
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
        <ThemeToggleButton />
      </div>
    </div>
  )
} 