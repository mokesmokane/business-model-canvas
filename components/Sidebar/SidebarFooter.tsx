import { Settings, HelpCircle, Users, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { useChat } from '@/contexts/ChatContext'

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

  return (
    <div className="mt-auto">
      <div className="border-t border-gray-800 p-4">
        {isExpanded ? (
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Profile
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Help
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
} 