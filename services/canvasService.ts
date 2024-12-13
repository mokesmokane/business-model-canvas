import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Canvas, Section } from '@/types/canvas';
import { CanvasSection, CanvasType } from '@/types/canvas-sections';
import { SerializedCanvas, SerializedSections } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid';
import { createNewCanvas } from '@/types/canvas';
import { addCanvasToFolder, } from './folderService';
import { TextSectionItem } from '@/types/canvas';

const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, removeUndefined(value)])
    );
  }
  return obj;
};
// Add this helper function at the top of the file
export const serializeCanvas = (canvas: Canvas): SerializedCanvas => {
    return  removeUndefined({
      ...canvas,
      sections: serializeSections(canvas.sections),
      createdAt: canvas.createdAt?.toISOString(),
      updatedAt: canvas.updatedAt?.toISOString(),
    });
  };
  
  // Add this helper function to deserialize data from Firestore
  export const deserializeCanvas = (data: SerializedCanvas): Canvas => {
    return {
      ...data,
      sections: deserializeSections(data.sections),
  
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  };
  
  // Helper functions for Map <-> Object conversion
  export const serializeSections = (sections: Map<string, Section>): SerializedSections => {
    const serializedSections: SerializedSections = {};
    sections.forEach((section, key) => {
      serializedSections[key] = {
        ...section,
        sectionItems: (section.sectionItems || []).map(item => ({
          ...item  // Just spread all properties directly
        }))
      };
    });
    return serializedSections;
  };
  
  export const deserializeSections = (sections: SerializedSections): Map<string, Section> => {
    const sectionsMap = new Map<string, Section>();
    Object.entries(sections).forEach(([key, section]) => {
      sectionsMap.set(key, {
        ...section,
        gridIndex: section.gridIndex,
        sectionItems: (section.sectionItems || []).map(item => {
          if (item.content !== undefined) {
            const textItem = new TextSectionItem(item.id, item.content);
            textItem.canvasLink = item.canvasLink;
            return textItem;
          }
          return item;
        })
      });
    });
    return sectionsMap;
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
    folderId: string,
    parentCanvasId: string | null,
    canvasId: string | null
  }) {
    const userId = this.getUserId();
    const now = new Date();
    //to Section
    
    const newCanvas = createNewCanvas(data.canvasId || uuidv4(), data.name, data.description, data.canvasType, data.parentCanvasId);

    const serializedCanvas = serializeCanvas(newCanvas);

    const docRef = doc(collection(db, 'userCanvases', userId, 'canvases'), newCanvas.id);
    await setDoc(docRef, serializedCanvas);
    await addCanvasToFolder(userId, data.folderId, {id: newCanvas.id, name: newCanvas.name, canvasTypeId: newCanvas.canvasType.id});

    return newCanvas;
  }

  // Add other canvas-related methods here
}

// Export a singleton instance
export const canvasService = CanvasService.getInstance(); 