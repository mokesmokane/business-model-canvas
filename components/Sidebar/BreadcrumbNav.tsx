import { ChevronRight, Home, LayoutDashboard, FolderPlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NestedCanvasFolder } from '@/types/canvas'
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
import { useCanvasFolders } from '@/contexts/CanvasFoldersContext'
import { useNewCanvas } from '@/contexts/NewCanvasContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import { DragEvent } from 'react'
import { cn } from '@/lib/utils'
import React from 'react'
import { MoveCanvasDialog } from "@/components/modals/MoveCanvasDialog"

interface BreadcrumbNavProps {
  path: NestedCanvasFolder[]
  onNavigate: (folder: NestedCanvasFolder | null) => void
}

interface MoveOperation {
  canvasId: string
  canvasName: string
  targetFolderId: string | null
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  const { onCanvasCreated, onCreateFolder, onCanvasMoved } = useCanvasFolders()
  const { setNewCanvas } = useNewCanvas()
  const { clearState } = useCanvas()
  const { isExpanded, setIsExpanded } = useExpanded()
  const [dragOverFolderId, setDragOverFolderId] = React.useState<string | null>(null)
  const [pendingMove, setPendingMove] = React.useState<MoveOperation | null>(null)

  const onAddFolder = () => {
    const currentFolder = (path.length > 0 ? path[path.length - 1] : null)?.id ?? 'root'
    onCreateFolder(currentFolder, 'New Folder')
  }

  const onAddCanvas = () => {
    clearState();
    setNewCanvas([true, path[path.length - 1]?.id ?? 'root']);
  }

  const onNav = (folder: NestedCanvasFolder | null) => {
    if(!isExpanded) {
      setIsExpanded(true)
      return
    }
    if (path.length === 0) {
      clearState()
      setNewCanvas([false, null])
    }
    onNavigate(folder)
  }

  const handleCanvasMove = async (canvasId: string, targetFolderId: string | null) => {
    const currentFolderId = path[path.length - 1]?.id ?? 'root'
    await onCanvasMoved(canvasId, currentFolderId, targetFolderId ?? 'root')
  }

  const getPathString = (targetFolderId: string | null) => {
    if (!targetFolderId) return "Root"
    if (targetFolderId === 'root') return "Root"
    
    const folderPath = path
      .slice(0, path.findIndex(f => f.id === targetFolderId) + 1)
      .map(f => f.name)
      .join(" → ")
    
    return folderPath || "Root"
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetFolderId: string | null) => {
    e.preventDefault()
    const canvasId = e.dataTransfer.getData('canvasId')
    const canvasName = e.dataTransfer.getData('canvasName')
    setPendingMove({ canvasId, canvasName, targetFolderId })
    setDragOverFolderId(null)
  }

  const handleMoveConfirm = async () => {
    if (!pendingMove) return
    const { canvasId, targetFolderId } = pendingMove
    await handleCanvasMove(canvasId, targetFolderId)
    setPendingMove(null)
  }

  if (!isExpanded) {
    return (
      <div className="flex flex-col items-center py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => onNav(null)}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Canvases
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <>
      <div className="text-sm font-semibold flex items-center justify-between px-3 py-2">
        <div className="flex items-center min-w-0">
          <div
            className={cn(
              "flex items-center",
              dragOverFolderId === 'root' && "bg-accent/50 rounded-md"
            )}
            onDragOver={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault()
              setDragOverFolderId('root')
            }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => handleDrop(e, null)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => onNav(null)}
            >
              <LayoutDashboard className="h-4 w-4" />
              {path.length === 0 && 'Canvases'}
            </Button>
          </div>
          {path.map((folder) => (
            <div 
              key={folder.id} 
              className={cn(
                "flex items-center min-w-0",
                dragOverFolderId === folder.id && "bg-accent/50 rounded-md"
              )}
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                setDragOverFolderId(folder.id)
              }}
              onDragLeave={() => setDragOverFolderId(null)}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 truncate text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => onNav(folder)}
              >
                {folder.name}
              </Button>
            </div>
          ))}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddFolder}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddCanvas}>
              <Plus className="h-4 w-4 mr-2" />
              New Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {pendingMove && (
        <MoveCanvasDialog
          isOpen={true}
          onClose={() => setPendingMove(null)}
          onConfirm={handleMoveConfirm}
          canvasName={pendingMove.canvasName}
          targetPath={getPathString(pendingMove.targetFolderId)}
        />
      )}
    </>
  )
} 