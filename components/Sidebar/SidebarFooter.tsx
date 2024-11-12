import React from 'react'
import { Settings, HelpCircle, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { useChat } from '@/contexts/ChatContext'
import { ThemeToggle } from '@/components/ThemeToggle'

interface SidebarFooterProps {
  isExpanded: boolean
  setShowAuthDialog: (show: boolean) => void
}

export function SidebarFooter({ isExpanded, setShowAuthDialog }: SidebarFooterProps) {
  const { user, logout } = useAuth();
  const { clearState } = useCanvas();
  const { clearMessages } = useChat();

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
    { icon: Users, label: 'Profile', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: HelpCircle, label: 'Help', action: () => {} },
    { icon: LogOut, label: 'Sign Out', action: handleSignOut },
  ];

  return (
    <div className={`mt-auto border-t border-gray-800 ${isExpanded ? 'py-2 px-4' : 'py-4'}`}>
      {isExpanded ? (
        <div className="flex flex-col gap-2">
          {footerItems.map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-gray-100 px-2"
              onClick={action}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-sm text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {footerItems.map(({ icon: Icon, label, action }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 p-0 text-gray-400 hover:text-gray-100"
                  onClick={action}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-gray-100 border-gray-800">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
          <ThemeToggle />
        </div>
      )}
    </div>
  )
}