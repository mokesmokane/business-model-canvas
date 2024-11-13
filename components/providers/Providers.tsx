import { AuthProvider } from './AuthProvider'
import { ExpandedProvider } from '@/contexts/ExpandedContext'
import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ExpandedProvider>
          {children}
        </ExpandedProvider>
      </ThemeProvider>
    </AuthProvider>
  )
} 