import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Canvas, Section } from '@/types/canvas';
import { CanvasSection, CanvasType } from '@/types/canvas-sections';
import { SerializedCanvas, SerializedSections } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid';
import { createNewCanvas } from '@/types/canvas';
import { addCanvasToFolder, } from './folderService';

// Add this helper function at the top of the file
export const serializeCanvas = (canvas: Canvas): SerializedCanvas => {
    return {
      ...canvas,
      sections: serializeSections(canvas.sections),
      createdAt: canvas.createdAt?.toISOString(),
      updatedAt: canvas.updatedAt?.toISOString(),
    };
  };
  
  // Add this helper function to deserialize data from Firestore
  export const deserializeCanvas = (data: SerializedCanvas): Canvas => {
    console.log('datamokes', data)
    return {
      ...data,
      sections: deserializeSections(data.sections),
  
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  };
  
  // Helper functions for Map <-> Object conversion
  export const serializeSections = (sections: Map<string, Section>): SerializedSections => {
    return Object.fromEntries(sections);
  };
  
  export const deserializeSections = (sections: SerializedSections): Map<string, Section> => {
    console.log('sections', sections)
    return new Map(Object.entries(sections));
  };
  
export class CanvasService {
  private static instance: CanvasService;
  private currentUserId: string | null = null;

  private constructor() {}

  public static getInstance(): CanvasService {
    if (!CanvasService.instance) {
      CanvasService.instance = new CanvasService();
    }
    return CanvasService.instance;
  }

  public initialize(userId: string) {
    this.currentUserId = userId;
  }

  public reset() {
    this.currentUserId = null;
  }

  private getUserId(): string {
    if (!this.currentUserId) {
      throw new Error('UserId not set. Call initialize first.');
    }
    return this.currentUserId;
  }

  async createNewCanvas(data: { 
    name: string, 
    description: string, 
    canvasType: CanvasType, 
    folderId: string
  }) {
    const userId = this.getUserId();
    const now = new Date();
    //to Section
    
    const newCanvas = createNewCanvas(uuidv4(), data.name, data.description, data.canvasType);

    const serializedCanvas = serializeCanvas(newCanvas);

    const docRef = doc(collection(db, 'userCanvases', userId, 'canvases'), newCanvas.id);
    await setDoc(docRef, serializedCanvas);
    await addCanvasToFolder(userId, data.folderId, {id: newCanvas.id, name: newCanvas.name, canvasTypeId: newCanvas.canvasType.id});

    return newCanvas.id;
  }

  // Add other canvas-related methods here
}

// Export a singleton instance
export const canvasService = CanvasService.getInstance(); 