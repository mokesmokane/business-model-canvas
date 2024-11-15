import React from 'react'
import { Bot, Shrink, Expand, MoreVertical, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatHeaderProps {
  isWide: boolean
  onClearChat: () => void
  onToggleWidth: () => void
  onClose?: () => void
}

export function ChatHeader({ isWide, onClearChat, onToggleWidth, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-4 border-b border-zinc-300/50 dark:border-zinc-800/50">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">AI Assistant</h3>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClearChat}>
              <Bot className="h-4 w-4 mr-2" />
              New Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose ? onClose : onToggleWidth}
        >
          {onClose ? <ChevronDown className="h-4 w-4" /> : isWide ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
} 