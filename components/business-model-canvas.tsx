"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useCanvas } from "@/contexts/CanvasContext"
import { useExpanded } from "@/contexts/ExpandedContext"
import React, { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar/Sidebar"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { Canvas } from "@/components/Canvas/Canvas"
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface BusinessModelCanvasProps {
  canvasId?: string 
}

export function BusinessModelCanvasComponent({ canvasId }: BusinessModelCanvasProps) {
  const { user } = useAuth()
  const { currentCanvas, status, error, loadCanvas } = useCanvas()
  const { setIsExpanded } = useExpanded()
  const [showAuthDialog, setShowAuthDialog] = React.useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (canvasId && typeof canvasId === 'string') {
      setIsLoading(true)
      loadCanvas(canvasId)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [canvasId, loadCanvas])

  
  const handleExpandSidebar = React.useCallback(() => {
    setIsExpanded(true)
  }, [])
  
  const handleSave = React.useCallback(async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
  }, [user])

  const renderError = () => {
    let title = 'Error Loading Canvas'
    let description = error || 'An unexpected error occurred while loading the canvas.'
    let icon = <AlertCircle className="h-4 w-4" />

      if (error?.includes('not found')) {
        title = 'Canvas Not Found'
        description = 'The canvas you\'re looking for doesn\'t exist or has been deleted.'
      } else if (error?.includes('permission') || error?.includes('access')) {
        title = 'Access Denied'
        description = 'You don\'t have permission to view this canvas.'
        icon = <ShieldAlert className="h-4 w-4" />
      }

      return (
        <div className="flex flex-1 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            {icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              {description}
            </AlertDescription>
          </Alert>
        </div>
      )
  }
  const renderContent = () => {
    
      return (
        <div className="flex h-full bg-white">
          <Sidebar setShowAuthDialog={setShowAuthDialog} />
          {(currentCanvas && !isLoading) ?
          <Canvas onExpandSidebar={handleExpandSidebar} />
          :
          (status === 'error' && !isLoading) ? renderError() 
          :
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading canvas...</p>
              </div>
            </div>
            }
        </div>
      )
  }
  
  return (
    <>
      {renderContent()}
      <AuthDialog 
        isOpen={showAuthDialog}
        openSignUp={false}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleSave}
      />
    </>
  )
}