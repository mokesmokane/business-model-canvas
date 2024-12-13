import { AuthProvider } from './AuthProvider'
import { ExpandedProvider } from '@/contexts/ExpandedContext'
import { ThemeProvider } from './ThemeProvider'
import { CanvasFoldersProvider } from '@/contexts/CanvasFoldersContext'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { CanvasServiceProvider } from '@/contexts/CanvasServiceContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CanvasServiceProvider>
        <SubscriptionProvider>
          <TooltipProvider> 
            <ExpandedProvider>
              {children}
            </ExpandedProvider>
          </TooltipProvider>
        </SubscriptionProvider>
      </CanvasServiceProvider>
    </AuthProvider>
  )
} 