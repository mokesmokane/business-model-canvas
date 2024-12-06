import { DocumentDiveInRequest, SuggestionRequest } from '@/app/api/ai-document-dive/types';
import { CanvasType } from '@/types/canvas-sections';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, where, getDocs } from 'firebase/firestore';

interface DocumentProcessingResponse {
  success: boolean;
  documentId: string;
  metadata: {
    textContent: string;
    fileName: string;
    contentType: string;
    pageCount: number;
    size: number;
    storagePath: string;
    canvasId: string;
  }
}

export interface CanvasDocument {
  id: string;
  fileName: string;
  contentType: string;
  pageCount: number;
  size: number;
  storagePath: string;
  canvasId: string;
  textContent?: string;
  uploadedAt: Date;
}

export interface ProcessedDocument {
  text: string;
  fileName: string;
}

export class DocumentService {
  static async processDocumentContent(textContent: string | undefined, canvasType: CanvasType, sections: string[]) {
    if (!textContent) return;
    const requestData: SuggestionRequest = {
      documentText: textContent,
      canvasType: canvasType,
      sections: sections
    }
    const response = await fetch('/api/ai-document-dive/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })

    const result = await response.json();
    console.log('result', result)
    return result;
  }
  private static readonly PROCESSING_URL = '/api/document-process';

  static async uploadAndProcess(file: File, canvasId: string): Promise<ProcessedDocument> {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('canvasId', canvasId);

    const response = await fetch(this.PROCESSING_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result: DocumentProcessingResponse = await response.json();

    if (!result.success || !result.metadata.textContent) {
      throw new Error('Failed to process document');
    }

    return {
      text: result.metadata.textContent,
      fileName: result.metadata.fileName
    };
  }

  static async getCanvasDocuments(userId: string, canvasId: string): Promise<CanvasDocument[]> {
    // documentmeta lives in firestore  
    const db = getFirestore();
    const documents = await getDocs(collection(db, `userDocuments/${userId}/canvases/${canvasId}/documents`));
    console.log('documents', documents)
    return documents.docs.map(doc => doc.data() as CanvasDocument);
  }
} 