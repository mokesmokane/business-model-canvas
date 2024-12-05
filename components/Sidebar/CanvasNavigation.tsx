'use client'

import * as React from 'react'
import { File, Folder, LayoutDashboard, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCanvas } from '@/contexts/CanvasContext'
import { useCanvasFolders } from '@/contexts/CanvasFoldersContext'
import { CanvasItem, NestedCanvasFolder } from '@/types/canvas'
import { cn } from '@/lib/utils'
import { DeleteCanvasDialog } from '../DeleteCanvasDialog'
import { BreadcrumbNav } from './BreadcrumbNav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteFolderDialog } from '../DeleteFolderDialog'
import { useState } from 'react'
import { RenameFolderDialog } from '../RenameFolderDialog'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DragEvent } from 'react'
import { MoveCanvasDialog } from "@/components/modals/MoveCanvasDialog"
import DynamicIcon from '../Util/DynamicIcon'
import { useCanvasTypes } from '@/contexts/CanvasTypeContext'
import { useRouter } from 'next/navigation'

function findFolderInTree(folders: NestedCanvasFolder[], folderId: string): NestedCanvasFolder | null {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    if (folder.children) {
      const found = findFolderInTree(folder.children, folderId);
      if (found) return found;
    }
  }
  return null;
}

interface MoveOperation {
  canvasId: string
  canvasName: string
  targetFolderId: string | null
  targetPath: string
}

function countCanvasesInFolder(folder: NestedCanvasFolder): number {
  let count = folder.canvases.size;
  
  if (folder.children) {
    for (const child of folder.children) {
      count += countCanvasesInFolder(child);
    }
  }
  
  return count;
}

interface CanvasNavigationProps { 
  isExpanded: boolean
}

export function CanvasNavigation({ isExpanded }: CanvasNavigationProps) {
  const { folders, rootFolder, onCanvasDeleted, onFolderRename, onFolderDelete, onCanvasMoved } = useCanvasFolders()
  const { loadCanvas, currentCanvas, deleteCanvas, clearState } = useCanvas()
  const { canvasTypes } = useCanvasTypes()
  const [currentPath, setCurrentPath] = React.useState<NestedCanvasFolder[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [canvasToDelete, setCanvasToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [deleteFolderDialog, setDeleteFolderDialog] = React.useState(false)
  const [folderToDelete, setFolderToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [folderToRename, setFolderToRename] = useState<{ id: string, name: string } | null>(null)
  const { user } = useAuth();
  const currentFolder = currentPath.length > 0 ? currentPath[currentPath.length - 1] : rootFolder
  const [draggedCanvas, setDraggedCanvas] = useState<CanvasItem | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<MoveOperation | null>(null)
  const router = useRouter()
  
  React.useEffect(() => {
    if (currentPath.length > 0) {
      const currentFolderId = currentPath[currentPath.length - 1].id;
      
      const updatedFolder = findFolderInTree(folders, currentFolderId);
      
      
      if (updatedFolder) {
        setCurrentPath(prev => {
          const newPath = [...prev];
          newPath[newPath.length - 1] = updatedFolder;
          return newPath;
        });
      } else {
        if (user?.uid) {
        const folderDoc = doc(db, 'userFolders', user.uid, 'folders', currentFolderId);
        getDoc(folderDoc).then(docSnap => {
          if (!docSnap.exists()) {
            setCurrentPath([]);
          }
          });
        }
      }
    }
  }, [folders, user?.uid]);

  const handleDeleteCanvas = async (canvasId: string) => {
    await deleteCanvas(canvasId)
    //delete from folder!
    await onCanvasDeleted(canvasId)

    setDeleteDialogOpen(false)
    setCanvasToDelete(null)
  }

  const handleNavigate = (folder: NestedCanvasFolder | null) => {

    if (!folder) {
      setCurrentPath([])
      return
    }
    
    const index = currentPath.findIndex(f => f.id === folder.id)
    if (index === -1) {
      setCurrentPath([...currentPath, folder])
    } else {
      setCurrentPath(currentPath.slice(0, index + 1))
    }
  }

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId) || 
                  currentFolder?.children.find(f => f.id === folderId)
    
    if (!folder) return
    
    setFolderToRename({ id: folderId, name: folder.name })
    setRenameDialogOpen(true)
  }

  const handleDeleteFolder = (folderId: string) => {
    
    const folder = folders.find(f => f.id === folderId) || 
                  currentFolder?.children.find(f => f.id === folderId)
    
    if (!folder) return
    
    setFolderToDelete({ id: folderId, name: folder.name })
    setDeleteFolderDialog(true)
  }

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return
  
    await onFolderDelete(folderToDelete.id)
    setDeleteFolderDialog(false)
    setFolderToDelete(null)
  }

  const confirmRenameFolder = async (newName: string) => {
    if (!folderToRename) return
  
    await onFolderRename(folderToRename.id, newName)
    setRenameDialogOpen(false)
    setFolderToRename(null)
  }

  const handleCanvasMove = async (canvasId: string, targetFolderId: string | null) => {
    if (!canvasId || !currentFolder) {
      return
    }

    try {
      await onCanvasMoved(
        canvasId,
        currentFolder.id ?? 'root',
        targetFolderId ?? 'root'
      )
    } catch (error) {
      throw error
    } finally {
      setPendingMove(null)
    }
  }

  const getPathString = (targetFolderId: string | null) => {
    if (!targetFolderId || targetFolderId === 'root') return "Root"
    
    const folder = findFolderInTree(folders, targetFolderId)
    if (!folder) return "Root"
    
    let path = []
    let current: NestedCanvasFolder | null = folder
    
    while (current) {
      path.unshift(current.name)
      if (!current.parentId || current.parentId === 'root') break;
      current = findFolderInTree(folders, current.parentId)
    }
    
    return path.join(" → ")
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetFolderId: string | null) => {
    e.preventDefault()
    
    // Clear drag states
    setDragOverFolderId(null)
    setDraggedCanvas(null)
    
    // Get the data
    const canvasId = e.dataTransfer.getData('canvasId')
    const canvasName = e.dataTransfer.getData('canvasName')
    
    // Prevent moving to same folder
    if (targetFolderId === currentFolder?.id) {
      return
    }
    const path = getPathString(targetFolderId)
    setPendingMove({ canvasId, canvasName, targetFolderId, targetPath: path })
  }

  const renderCanvasItem = (canvas: CanvasItem) => (
    <div 
      key={canvas.id} 
      className="flex items-center group px-2 py-1 w-full"
      draggable
      onDragStart={(e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('canvasId', canvas.id)
        e.dataTransfer.setData('canvasName', canvas.name)
        setDraggedCanvas(canvas)
      }}
      onDragEnd={() => {
        setDraggedCanvas(null)
        setDragOverFolderId(null)
      }}
    >
      <Button
        variant="ghost"
        className={cn(
          "flex-1 justify-start text-left text-muted-foreground hover:text-foreground hover:bg-accent min-w-0",
          currentCanvas?.id === canvas.id && 'bg-muted font-medium border-l-2 border-primary'
        )}
        onClick={() => handleCanvasClick(canvas.id)}
      >
        <DynamicIcon name={canvasTypes[canvas.canvasTypeId]?.icon} className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate">{canvas.name}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
        onClick={() => {
          setCanvasToDelete({ id: canvas.id, name: canvas.name })
          setDeleteDialogOpen(true)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const renderCurrentFolder = () => {
    const displayFolder = currentFolder || folders.find(f => f.id === 'root')
    if (!displayFolder) return null
    
    return (
      <div className="space-y-1 overflow-y-auto overflow-x-hidden px-2">
        {displayFolder.children.map((folder) => (
          <div 
            key={folder.id} 
            className={cn(
              "flex items-center group px-2 py-1",
              dragOverFolderId === folder.id && "bg-accent/50"
            )}
            onDragOver={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault()
              setDragOverFolderId(folder.id)
            }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={(e) => handleDrop(e, folder.id)}
          >
            <Button
              variant="ghost"
              className="flex-1 justify-start text-left text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => handleNavigate(folder)}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span className="flex-1 truncate">{folder.name}</span>
              {countCanvasesInFolder(folder) > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {countCanvasesInFolder(folder)}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => handleRenameFolder(folder.id)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    console.log('Delete clicked for folder:', folder.id)
                    handleDeleteFolder(folder.id)
                  }}
                  className="text-destructive focus:text-destructive" >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {Array.from(displayFolder.canvases.values()).map((canvas) =>
          renderCanvasItem(canvas)
        )}
      </div>
    )
  }

  const handleCanvasClick = (canvasId: string) => {
    localStorage.setItem('lastCanvasId', canvasId)
    router.push(`/canvas/${canvasId}`)
  }

  return (
    <div className="space-y-2 w-full flex flex-col h-full">
      <BreadcrumbNav isExpanded={isExpanded} path={currentPath} onNavigate={handleNavigate} />
      {isExpanded && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderCurrentFolder()}
        </div>
      )}
      {canvasToDelete && (
        <DeleteCanvasDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => handleDeleteCanvas(canvasToDelete.id)}
          canvasName={canvasToDelete.name}
        />
      )}
      {folderToDelete && (
        <DeleteFolderDialog
          open={deleteFolderDialog}
          onOpenChange={setDeleteFolderDialog}
          onConfirm={confirmDeleteFolder}
          folderName={folderToDelete.name}
          hasContents={
            Boolean(
              currentFolder?.children
                .find(f => f.id === folderToDelete.id)?.children?.length ||
              currentFolder?.children
                .find(f => f.id === folderToDelete.id)?.canvases?.size
            )
          }
        />
      )}
      {folderToRename && (
        <RenameFolderDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          onConfirm={confirmRenameFolder}
          folderName={folderToRename.name}
        />
      )}
      {pendingMove && (
        <MoveCanvasDialog
          isOpen={true}
          onClose={() => setPendingMove(null)}
          onConfirm={() => handleCanvasMove(pendingMove.canvasId, pendingMove.targetFolderId)}
          canvasName={pendingMove.canvasName}
          targetPath={pendingMove.targetPath}
        />
      )}
    </div>
  )
}

export default CanvasNavigation




