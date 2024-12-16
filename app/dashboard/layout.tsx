'use client'

import { CanvasTypeProvider } from '@/contexts/CanvasTypeContext'
import { LayoutProvider } from '@/contexts/LayoutContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutProvider>
      <CanvasTypeProvider>
        {children}
      </CanvasTypeProvider>
    </LayoutProvider>
  )
} 