'use client'

import * as React from 'react'
import { File, Folder, LayoutDashboard, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useCanvas } from '@/contexts/CanvasContext'
import { useCanvasFolders } from '@/contexts/CanvasFoldersContext'
import { useNewCanvas } from '@/contexts/NewCanvasContext'
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
import { useExpanded } from '@/contexts/ExpandedContext';
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

export function CanvasNavigation() {
  const { folders, rootFolder, onCreateFolder, onFolderRename, onFolderDelete } = useCanvasFolders()
  const { loadCanvas, currentCanvas, deleteCanvas, clearState } = useCanvas()
  const { setNewCanvas } = useNewCanvas()
  const [currentPath, setCurrentPath] = React.useState<NestedCanvasFolder[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [canvasToDelete, setCanvasToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [deleteFolderDialog, setDeleteFolderDialog] = React.useState(false)
  const [folderToDelete, setFolderToDelete] = React.useState<{ id: string, name: string } | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [folderToRename, setFolderToRename] = useState<{ id: string, name: string } | null>(null)
  const { user } = useAuth();
  const { isExpanded } = useExpanded()
  const currentFolder = currentPath.length > 0 ? currentPath[currentPath.length - 1] : rootFolder
  
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

  const handleNewCanvas = (folderId: string | null) => {
    clearState()
    setNewCanvas([true, folderId])
  }

  const handleDeleteCanvas = async (canvasId: string) => {
    await deleteCanvas(canvasId)
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
    console.log('handleDeleteFolder called with ID:', folderId)
    console.log('Current folders:', folders)
    console.log('Current folder:', currentFolder)
    
    const folder = folders.find(f => f.id === folderId) || 
                  currentFolder?.children.find(f => f.id === folderId)
    
    console.log('Found folder:', folder)
    
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

  const renderCanvasItem = (canvas: CanvasItem) => (
    <div key={canvas.id} className="flex items-center group px-4 py-1">
      <Button
        variant="ghost"
        className={cn(
          "flex-1 justify-start text-left text-muted-foreground hover:text-foreground hover:bg-accent",
          currentCanvas?.id === canvas.id && 'bg-muted font-medium border-l-2 border-primary'
        )}
        onClick={() => loadCanvas(canvas.id)}
      >
        <File className="mr-2 h-4 w-4" />
        <span className="flex-1 truncate">{canvas.name}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
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
      <div className="space-y-1">
        {displayFolder.children.map((folder) => (
          <div key={folder.id} className="flex items-center group px-4 py-1">
            <Button
              variant="ghost"
              className="flex-1 justify-start text-left text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => handleNavigate(folder)}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span className="flex-1 truncate">{folder.name}</span>
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
  return (
    <div className="space-y-2 w-full">
      <BreadcrumbNav path={currentPath} onNavigate={handleNavigate} />
      {isExpanded && renderCurrentFolder()}
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
    </div>
  )
}

export default CanvasNavigation



