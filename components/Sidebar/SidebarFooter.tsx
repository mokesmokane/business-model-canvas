import { Settings, HelpCircle, Users, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarFooterProps {
  isExpanded: boolean
  setShowAuthDialog: (show: boolean) => void
}

export function SidebarFooter({ isExpanded, setShowAuthDialog }: SidebarFooterProps) {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="mt-auto">
      <div className="border-t p-4">
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
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        {user ? (
          <div className={`flex items-center gap-2 ${!isExpanded && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {isExpanded && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthDialog(true)}
            className={`w-full p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${
              !isExpanded && 'flex justify-center'
            }`}
          >
            {isExpanded ? 'Sign In' : <User className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
} 