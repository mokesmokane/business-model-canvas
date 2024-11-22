// folderService.ts

import { addDoc, collection, doc, getDocs, query, setDoc, where, updateDoc, deleteField, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Canvas, CanvasFolder, CanvasItem, NestedCanvasFolder } from '@/types/canvas';

export async function loadAndBuildFolders(userId: string): Promise<NestedCanvasFolder[]> {
  // Step 1: Load all folders for the user
  const folders = await loadAllFolders(userId);

  // Step 2: Build the nested folder structure
  const nestedFolders = buildNestedFolders(folders);

  return nestedFolders;
}

export async function loadAllFolders(userId: string): Promise<CanvasFolder[]> {
  const foldersRef =  collection(db, 'userFolders', userId, 'folders')
  const querySnapshot = await getDocs(foldersRef);

  const folders: CanvasFolder[] = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      parentId: data.parentId || null,
      canvases: new Map(Object.entries(data.canvases || {})),
    };
  });

  return folders;
}

export async function createRootFolder(userId: string): Promise<CanvasFolder> {
  const folderRef = collection(db, 'userFolders', userId, 'folders');
  const newFolder = {
    name: "Root",
    canvases: {}
    };
  const docRef = await setDoc(doc(folderRef, "root"), newFolder);
  return {
    id: "root",
    ...newFolder
  } as CanvasFolder;
}

export async function createFolder(userId: string, name: string, parentId?: string): Promise<CanvasFolder> {
  const folderRef = collection(db, 'userFolders', userId, 'folders');
  const newFolder = {
    name,
    parentId: parentId || null,
    canvases: {}
  };
  const docRef = await addDoc(folderRef, newFolder);
  return { 
    id: docRef.id,
    name,
    parentId: parentId || null,
    canvases: new Map()
  } as CanvasFolder;
}

export function buildNestedFolders(folders: CanvasFolder[]): NestedCanvasFolder[] {
  const folderMap: { [key: string]: NestedCanvasFolder } = {};
  const roots: NestedCanvasFolder[] = [];

  // Initialize the folderMap with folders and empty children arrays
  folders.forEach(folder => {
    folderMap[folder.id] = { ...folder, children: [] };
  });

  // Build the tree
  folders.forEach(folder => {
    const parentId = folder.parentId;
    if (parentId && folderMap[parentId]) {
      folderMap[parentId].children.push(folderMap[folder.id]);
    } else {
      // If no parentId or parent not found, it's a root folder
      roots.push(folderMap[folder.id]);
    }
  });

  return roots;
}

export async function renameFolder(userId: string, folderId: string, newName: string): Promise<void> {
  const folderRef = doc(db, 'userFolders', userId, 'folders', folderId);
  await updateDoc(folderRef, { name: newName });
}

export async function deleteFolder(userId: string, folderId: string): Promise<void> {
  const folderRef = doc(db, 'userFolders', userId, 'folders', folderId);
  await deleteDoc(folderRef);
}

export async function getFolderCanvas(userId: string, oldFolderId: string, canvasId: string): Promise<CanvasItem> {
  const folderRef = doc(db, 'userFolders', userId, 'folders', oldFolderId);
  const docSnapshot = await getDoc(folderRef);
  return docSnapshot.data()?.canvases[canvasId] as CanvasItem;
}

export async function moveCanvasToFolder(userId: string, oldFolderId: string, newFolderId: string, canvasId: string): Promise<void> {
  const canvasItem = await getFolderCanvas(userId, oldFolderId, canvasId);
  
  await removeCanvasFromFolder(userId, oldFolderId, canvasId);
  await addCanvasToFolder(userId, newFolderId, canvasItem);
}

export async function addCanvasToFolder(userId: string, folderId: string, canvas: CanvasItem): Promise<void> {
  console.log('addCanvasToFolder', userId, folderId, canvas);
  const folderRef = doc(db, 'userFolders', userId, 'folders', folderId);
  await updateDoc(folderRef, {
    [`canvases.${canvas.id}`]: canvas
  });
}

export async function removeCanvasFromFolder(userId: string, folderId: string, canvasId: string): Promise<void> {
  const folderRef = doc(db, 'userFolders', userId, 'folders', folderId);
  await updateDoc(folderRef, {
    [`canvases.${canvasId}`]: deleteField()
  });
}
