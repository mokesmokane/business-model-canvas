'use client'

import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onResize: (width: number) => void
  sidebarRef: React.RefObject<HTMLDivElement>
  onResizeStart: () => void
  onResizeEnd: () => void
}

export function ResizeHandle({ onResize, sidebarRef, onResizeStart, onResizeEnd }: ResizeHandleProps) {
  const isDragging = useRef(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    onResizeStart()
    document.body.style.cursor = 'ew-resize'
    document.body.classList.add('select-none')
    
    const startX = e.pageX
    const startWidth = sidebarRef.current?.offsetWidth || 384

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return
      
      const deltaX = moveEvent.pageX - startX
      const newWidth = Math.max(250, Math.min(800, startWidth + deltaX))
      
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`
      }
    }
    
    const handleMouseUp = () => {
      isDragging.current = false
      onResizeEnd()
      document.body.style.cursor = ''
      document.body.classList.remove('select-none')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (sidebarRef.current) {
        onResize(sidebarRef.current.offsetWidth)
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize z-50",
        "hover:bg-gray-600 transition-colors",
        "after:absolute after:right-0 after:top-0 after:bottom-0 after:w-4 after:translate-x-1/2"
      )}
      onMouseDown={handleMouseDown}
    />
  )
} 