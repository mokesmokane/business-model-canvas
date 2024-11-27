import React, { useContext } from 'react'
import { Bot, Shrink, Expand, MoreVertical, ChevronDown, Layers, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCanvas } from '@/contexts/CanvasContext'
import DynamicIcon from '../Util/DynamicIcon'
import { Info } from 'lucide-react'
import { useAIAgents } from '@/contexts/AIAgentContext'
import { useCanvasContext } from '@/contexts/ContextEnabledContext'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ChatHeaderProps {
  isWide: boolean
  onNewChat: () => void
  onToggleWidth: () => void
  onClose?: () => void
}

export function ChatHeader({ isWide, onNewChat, onToggleWidth, onClose }: ChatHeaderProps) {
  const { currentCanvas } = useCanvas()
  const { agentCache } = useAIAgents()
  const { isContextEnabled, setIsContextEnabled } = useCanvasContext()
  console.log('ChatHeader isContextEnabled:', isContextEnabled)
  const aiAgent = currentCanvas?.canvasType.id ? agentCache[currentCanvas.canvasType.id] : null
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">{isContextEnabled ? aiAgent?.name || 'AI Assistant' : 'AI Assistant'}</h3>
        </div>
        {currentCanvas && (
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isContextEnabled ? 'secondary' : 'ghost'}
                      className={`px-2 py-1 h-7 text-xs font-medium ${
                        !isContextEnabled ? 'text-muted-foreground' : ''
                      }`}
                      onClick={() => {
                        console.log('toggling context enabled')
                        setIsContextEnabled(!isContextEnabled)
                      }}
                    >
                      <DynamicIcon name={currentCanvas.canvasType.icon} className="h-4 w-4 mr-1" />
                      <span className={!isContextEnabled ? 'line-through' : ''}>
                        {currentCanvas.name}
                      </span>
                      {isContextEnabled ? (
                        <Check className="h-3 w-3 mr-1 text-primary" />
                      ) : (
                        <X className="h-3 w-3 mr-1 text-muted-foreground" />
                      )}
                    </Button>
              </TooltipTrigger>
              <TooltipContent>
                Toggle whether the AI assistant has access to the current canvas context
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {!currentCanvas && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
              >
                <span className="text-sm text-muted-foreground">No canvas context</span>
                <Info className="h-3 w-3 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 text-sm">
              Open a canvas to give the AI assistant context about your work. 
              When a canvas is open, you can enable context to let the AI see and understand your canvas content.
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex items-center gap-1">
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
            <DropdownMenuItem onClick={onNewChat}>
              <Bot className="h-4 w-4 mr-2" />
              New Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onClose ? onClose : onToggleWidth}
        >
          {onClose ? (
            <ChevronDown className="h-4 w-4" />
          ) : isWide ? (
            <Shrink className="h-4 w-4" />
          ) : (
            <Expand className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

