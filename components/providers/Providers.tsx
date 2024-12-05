import { AuthProvider } from './AuthProvider'
import { ExpandedProvider } from '@/contexts/ExpandedContext'
import { ThemeProvider } from './ThemeProvider'
import { CanvasFoldersProvider } from '@/contexts/CanvasFoldersContext'
import { TooltipProvider } from '@radix-ui/react-tooltip'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TooltipProvider> 
        <ExpandedProvider>
          {children}
        </ExpandedProvider>
      </TooltipProvider>
    </AuthProvider>
  )
} 