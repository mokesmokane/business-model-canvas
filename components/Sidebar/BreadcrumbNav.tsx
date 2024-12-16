import { ChevronRight, Home, LayoutDashboard, FolderPlus, Plus, FileText } from 'lucide-react'
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
import { useExpanded } from '@/contexts/ExpandedContext'
import { DragEvent } from 'react'
import { cn } from '@/lib/utils'
import React from 'react'
import { MoveCanvasDialog } from "@/components/modals/MoveCanvasDialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CanvasTypeSelector } from "@/components/CanvasTypeSelector"
import { DialogTitle } from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { DocumentDiveSelector } from '../DocumentDiveSelector'
import { DocumentDiveSuggestionsProvider } from '@/contexts/DocumentDiveSuggestionsContext'
import { DocumentAiGenerationProvider } from '@/contexts/DocumentAiGenerationContext'
import { MobileDocumentDiveSelector } from '../MobileDocumentDiveSelector'
import { useMediaQuery } from '@/hooks/use-media-query'

interface BreadcrumbNavProps {
  path: NestedCanvasFolder[]
  onNavigate: (folder: NestedCanvasFolder | null) => void
  isExpanded: boolean
}

interface MoveOperation {
  canvasId: string
  canvasName: string
  targetFolderId: string | null
}

export function BreadcrumbNav({ path, onNavigate, isExpanded }: BreadcrumbNavProps) {
  const { onCreateFolder, onCanvasMoved } = useCanvasFolders()
  const { setIsExpanded } = useExpanded()
  const [dragOverFolderId, setDragOverFolderId] = React.useState<string | null>(null)
  const [pendingMove, setPendingMove] = React.useState<MoveOperation | null>(null)
  const [showTypeSelector, setShowTypeSelector] = React.useState(false)
  const [showDocumentDiveSelector, setShowDocumentDiveSelector] = React.useState(false)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const onAddFolder = () => {
    const currentFolder = (path.length > 0 ? path[path.length - 1] : null)?.id ?? 'root'
    onCreateFolder(currentFolder, 'New Folder')
  }

  const onAddCanvas = () => {
    setShowTypeSelector(true)
  }

  const onAddCanvasFromDocument = () => {
    setShowDocumentDiveSelector(true)
  }

  const onNav = (folder: NestedCanvasFolder | null) => {
    if(!isExpanded) {
      setIsExpanded(true)
      return
    }
    if (path.length === 0) {
      //navigate to the canvases page
      router.push('/dashboard')
      return
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

  const handleDocumentSelectorSuccess = (canvasId: string) => {
    setShowDocumentDiveSelector(false)
    router.push(`/canvas/${canvasId}`)
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
            <DropdownMenuItem onClick={onAddCanvasFromDocument}>
              <FileText className="h-4 w-4 mr-2" />
              From Document
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
      <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
        <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
          <DialogTitle></DialogTitle>
          <CanvasTypeSelector selectedType={null} />
        </DialogContent>
      </Dialog>
      {!isMobile ? (
        <Dialog open={showDocumentDiveSelector} onOpenChange={setShowDocumentDiveSelector}>
          <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
            <DialogTitle></DialogTitle>
            <DocumentAiGenerationProvider>
              <DocumentDiveSuggestionsProvider>
                <DocumentDiveSelector 
                  pdfContent={null} 
                  onClose={() => setShowDocumentDiveSelector(false)} 
                  onPdfLoaded={() => {}} 
                  onSuccess={handleDocumentSelectorSuccess} 
                />
              </DocumentDiveSuggestionsProvider>
            </DocumentAiGenerationProvider>
          </DialogContent>
        </Dialog>
      ) : (
        <DocumentAiGenerationProvider>
          <DocumentDiveSuggestionsProvider>
            <MobileDocumentDiveSelector
              isOpen={showDocumentDiveSelector}
              onClose={() => setShowDocumentDiveSelector(false)}
              onSuccess={handleDocumentSelectorSuccess}
            />
          </DocumentDiveSuggestionsProvider>
        </DocumentAiGenerationProvider>
      )}
    </>
  )
} 