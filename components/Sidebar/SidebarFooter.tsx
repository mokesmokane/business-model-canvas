import React from 'react'
import { Settings, HelpCircle, Users, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { useChat } from '@/contexts/ChatContext'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

interface SidebarFooterProps {
  isExpanded: boolean
  setShowAuthDialog: (show: boolean) => void
}

export function SidebarFooter({ isExpanded, setShowAuthDialog }: SidebarFooterProps) {
  const { user, logout } = useAuth();
  const { clearState } = useCanvas();
  const { clearMessages } = useChat();
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await logout();
      clearState();
      clearMessages();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const footerItems = [
    { icon: Users, label: 'Profile', action: () => router.push('/profile') },
    { icon: Settings, label: 'Settings', action: () => router.push('/settings') },
    { icon: theme === "light" ? Moon : Sun, label: 'Theme', action: () => { setTheme(theme === "light" ? "dark" : "light") } },
    { icon: HelpCircle, label: 'Help', action: () => router.push('/help') },
    { icon: LogOut, label: 'Sign Out', action: handleSignOut },
  ];

  return (
    <div className={`mt-auto border-t border-zinc-300/50 dark:border-zinc-800/50 ${isExpanded ? 'py-2 px-4' : 'py-4'}`}>
      {isExpanded ? (
        <div className="flex flex-col gap-2">
          {footerItems.map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2"
              onClick={action}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {footerItems.map(({ icon: Icon, label, action }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={action}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  )
}