import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Canvas } from '@/types/canvas';
import { CanvasType } from '@/types/canvas-sections';
import { v4 as uuidv4 } from 'uuid';

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
    const newCanvas = {
      id: uuidv4(),
      userId,
      name: data.name,
      description: data.description,
      canvasType: data.canvasType,
      createdAt: now,
      updatedAt: now
    };

    const docRef = doc(collection(db, 'userCanvases', userId, 'canvases'), newCanvas.id);
    await setDoc(docRef, newCanvas);

    return newCanvas.id;
  }

  // Add other canvas-related methods here
}

// Export a singleton instance
export const canvasService = CanvasService.getInstance(); 