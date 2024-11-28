'use client'

import { ReadOnlyCanvas } from '@/components/Canvas/ReadOnlyCanvas'
import { CanvasProvider } from '@/contexts/CanvasContext'
import { useEffect, use, useRef, useState } from 'react'
import { useCanvas } from '@/contexts/CanvasContext'
import { CanvasFoldersProvider } from '@/contexts/CanvasFoldersContext'
import { Providers } from '@/components/providers/Providers'
import { ThemeProvider } from 'next-themes'
import { AIAgentProvider } from '@/contexts/AIAgentContext'
import { CanvasContextProvider } from '@/contexts/ContextEnabledContext'
import { Button } from '@/components/ui/button'
import { FileImage, FileText } from 'lucide-react'
import html2canvas from 'html2canvas'
import { CanvasPDF } from '@/components/Canvas/CanvasPDF'
import { pdf } from '@react-pdf/renderer'

function ScreenshotContent({ id }: { id: string }) {
  const { loadCanvas, formData } = useCanvas()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await loadCanvas(id)
      setIsLoading(false)
    }
    load()
  }, [id, loadCanvas])

  const downloadPNG = async () => {
    if (!canvasRef.current || !formData) return
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const elements = canvasRef.current.getElementsByTagName('*')
    let maxHeight = 0
    for (const element of elements) {
      const rect = element.getBoundingClientRect()
      const bottom = rect.top + rect.height
      maxHeight = Math.max(maxHeight, bottom)
    }
    
    const canvas = await html2canvas(canvasRef.current, {
      width: canvasRef.current.offsetWidth,
      height: maxHeight + 50,
      useCORS: true,
      background: '#ffffff',
      logging: false,
      allowTaint: true
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData?.name || 'canvas'}-${new Date().toISOString().split('T')[0]}.png`
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png', 1.0)
  }

  const downloadPDF = async () => {
    if (!formData) return

    const blob = await pdf(
      <CanvasPDF 
        title={formData.name}
        description={formData.description}
        sections={formData.sections} 
        canvasType={formData.canvasType}
        canvasLayout={formData.canvasLayout}
      />
    ).toBlob()
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData?.name || 'canvas'}-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading || !formData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-pulse">Loading canvas...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      <div ref={canvasRef}>
        <ReadOnlyCanvas 
          sections={formData.sections}
          canvasType={formData.canvasType}
          canvasLayout={formData.canvasLayout}
          title={formData.name}
          description={formData.description}
        />
      </div>
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          onClick={downloadPNG}
          className="shadow-lg"
          size="lg"
        >
          <FileImage className="mr-2 h-4 w-4" />
          Save as PNG
        </Button>
        <Button
          onClick={downloadPDF}
          className="shadow-lg"
          size="lg"
        >
          <FileText className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
      </div>
    </div>
  )
}

export default function ScreenshotPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>
        <CanvasFoldersProvider>
          <CanvasContextProvider>
            <AIAgentProvider>
              <CanvasProvider>
                <ScreenshotContent id={resolvedParams.id} />
              </CanvasProvider>
            </AIAgentProvider>
          </CanvasContextProvider>
        </CanvasFoldersProvider>
      </Providers>
    </ThemeProvider>
  )
} 