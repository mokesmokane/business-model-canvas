import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Canvas, CanvasFolder, CanvasItem, NestedCanvasFolder } from '@/types/canvas';
import { loadAndBuildFolders, moveCanvasToFolder, deleteFolder, renameFolder, buildNestedFolders } from '@/services/folderService';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an auth context
import { createRootFolder, createFolder } from '@/services/folderService';
import { addCanvasToFolder, removeCanvasFromFolder } from '@/services/folderService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CanvasFoldersContextType {
  getFolders: () => Promise<NestedCanvasFolder[]>;
  refreshFolders: () => Promise<void>;
  isLoading: boolean;
  folders: NestedCanvasFolder[];
  currentFolder: NestedCanvasFolder | null;
  setCurrentFolder: (folder: NestedCanvasFolder | null) => void;
  rootFolderId: string;
  rootFolder: NestedCanvasFolder | null;
  canvasIdFolderMap: Map<string, string>;
  onCreateFolder: (parentId: string, name: string) => void;
  onCanvasCreated: (canvasItem: CanvasItem, folderId: string) => void;
  onCanvasMoved: (canvasId: string, oldFolderId: string,folderId: string) => void;
  onCanvasDeleted: (canvasId: string) => void;
  onFolderDelete: (folderId: string) => Promise<void>;
  onFolderRename: (folderId: string, newName: string) => Promise<void>;

}

const CanvasFoldersContext = createContext<CanvasFoldersContextType | undefined>(undefined);



export function CanvasFoldersProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<NestedCanvasFolder[]>([]);
  const [rootFolder, setRootFolder] = useState<NestedCanvasFolder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Get the current user
  const rootFolderId = "root"
  const [canvasIdFolderMap, setCanvasIdFolderMap] = useState<Map<string, string>>(new Map());
  const [currentFolder, setCurrentFolder] = useState<NestedCanvasFolder | null>(null)

  // Add real-time listener for folders
  useEffect(() => {
    if (!user?.uid) return;

    const foldersRef = collection(db, 'userFolders', user.uid, 'folders');
    
    const unsubscribe = onSnapshot(foldersRef, async (snapshot) => {
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        parentId: doc.data().parentId || null,
        canvases: new Map(Object.entries(doc.data().canvases || {})),
      }));
      
      const nestedFolders = buildNestedFolders(folders as CanvasFolder[]);
      setFolders(nestedFolders);
      
      // Update current folder if needed
      setRootFolder(nestedFolders.find(folder => folder.id === rootFolderId) || null);
      if (!currentFolder) {
        const root = nestedFolders.find(folder => folder.id === rootFolderId);
        setCurrentFolder(root || null);
      }

      const canvasIdFolderMap = new Map<string, string>();
      nestedFolders.forEach(folder => {
        folder.canvases.forEach((id) => {
          canvasIdFolderMap.set(id.id, folder.id);
        });
      });
      setCanvasIdFolderMap(canvasIdFolderMap);
    });



    return () => unsubscribe();
  }, [user?.uid]);

  const getFolders = useCallback(async () => {
    if (!user?.uid) {
      return [];
    }

    setIsLoading(true);
    try {
      const loadedFolders = await loadAndBuildFolders(user.uid);
      setFolders(loadedFolders);
      const root = loadedFolders.find(folder => folder.id === rootFolderId)
      if (!root) {
        await createRootFolder(user.uid)
      }
      setCurrentFolder(loadedFolders.find(folder => folder.id === rootFolderId) || null);
      return loadedFolders;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const refreshFolders = useCallback(async () => {
    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    try {
      const loadedFolders = await loadAndBuildFolders(user.uid);
      setFolders(loadedFolders);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const onCreateFolder = useCallback(async (parentId: string, name: string) => {
    if (!user?.uid) return;
    
    try {
      await createFolder(user.uid, name, parentId);
      await refreshFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }, [user?.uid, refreshFolders]);

  const onCanvasCreated = useCallback(async (canvasItem: CanvasItem, folderId: string) => {
    if (!user?.uid) return;

    try {
      await addCanvasToFolder(user.uid, folderId, canvasItem);
      await refreshFolders();
    } catch (error) {
      console.error("Error adding canvas to folder:", error);
    }
  }, [user?.uid, refreshFolders]);

  const onCanvasMoved = useCallback(async (canvasId: string, oldFolderId: string, newFolderId: string) => {
    if (!user?.uid) return;

    try {
      await moveCanvasToFolder(user.uid, oldFolderId, newFolderId, canvasId);
      await refreshFolders();
    } catch (error) {
      console.error("Error moving canvas:", error);
    }
  }, [user?.uid, folders, refreshFolders]);

  const searchNestedFolders = (folders: NestedCanvasFolder[], canvasId: string): NestedCanvasFolder | null => {
    for (const folder of folders) {
      if (folder.canvases.has(canvasId)) return folder;
      const result = searchNestedFolders(folder.children, canvasId);
      if (result) return result;
    }
    return null;
  }

  const onCanvasDeleted = useCallback(async (canvasId: string) => {
    if (!user?.uid) return;

    try {
      // Find folder containing the canvas
      const folder = searchNestedFolders(folders, canvasId);

      if (folder) {
        await removeCanvasFromFolder(user.uid, folder.id, canvasId);
        await refreshFolders();
      }
    } catch (error) {
      console.error("Error removing canvas:", error);
    }
  }, [user?.uid, folders, refreshFolders]);

  const onFolderDelete = useCallback(async (folderId: string) => {
    if (!user?.uid || folderId === rootFolderId) return;

    try {
      await deleteFolder(user.uid, folderId);
      await refreshFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }, [user?.uid, refreshFolders]);

  const onFolderRename = useCallback(async (folderId: string, newName: string) => {
    if (!user?.uid || folderId === rootFolderId) return;

    try {
      // Implement folder rename in folderService
      await renameFolder(user.uid, folderId, newName);
      await refreshFolders();
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  }, [user?.uid, refreshFolders]);

  useEffect(() => {
    if (!user?.uid) return;
    getFolders()
  }, [user?.uid])


  return (
    <CanvasFoldersContext.Provider value={{ 
      getFolders, 
      refreshFolders, 
      isLoading, 
      folders, 
      rootFolder, 
      onCreateFolder, 
      onCanvasCreated, 
      onCanvasMoved, 
      onCanvasDeleted, 
      currentFolder, 
      setCurrentFolder, 
      rootFolderId, 
      onFolderDelete, 
      onFolderRename,
      canvasIdFolderMap
    }}>
      {children}
    </CanvasFoldersContext.Provider>
  );
}

export const useCanvasFolders = () => {
  const context = useContext(CanvasFoldersContext);
  if (!context) {
    throw new Error('useCanvasFolders must be used within a CanvasFoldersProvider');
  }
  return context;
};
