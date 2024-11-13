'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, DocumentData, onSnapshot, where, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import debounce from 'lodash/debounce';
import { BusinessModelCanvas } from '@/types/canvas';
import { deleteDoc } from 'firebase/firestore';


interface CanvasState {
  currentCanvas: BusinessModelCanvas | null;
  formData: BusinessModelCanvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
}

const initialCanvasState: BusinessModelCanvas = {
  companyName: '',
  companyDescription: '',
  designedFor: '',
  designedBy: '',
  date: new Date().toISOString().split('T')[0],
  version: '1.0',
  keyPartners: [],
  keyActivities: [],
  valuePropositions: [],
  customerRelationships: [],
  channels: [],
  customerSegments: [],
  keyResources: [],
  costStructure: [],
  revenueStreams: []
};

interface CanvasContextType {
  currentCanvas: BusinessModelCanvas | null;
  formData: BusinessModelCanvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  userCanvases: DocumentData[];
  updateField: (field: keyof BusinessModelCanvas, value: string) => void;
  updateSection: (sectionKey: string, value: string[]) => void;
  loadCanvas: (id: string) => Promise<void>;
  createNewCanvas: (data: { name: string, description: string }) => Promise<string | undefined>;
  resetForm: () => void;
  deleteCanvas: (id: string) => Promise<void>;
  clearState: () => void;
}

export const CanvasContext = createContext<CanvasContextType>({
  currentCanvas: null,
  formData: initialCanvasState,
  status: 'idle',
  error: null,
  userCanvases: [],
  updateField: () => {},
  updateSection: () => {},
  loadCanvas: async () => {},
  createNewCanvas: async () => { return ''  },
  resetForm: () => {},
  deleteCanvas: async () => {},
  clearState: () => {},
});

const AUTOSAVE_DELAY = 1000;

// Add this helper function at the top of the file
const serializeCanvas = (canvas: BusinessModelCanvas) => {
  const serialized = {
    ...canvas,
    createdAt: canvas.createdAt instanceof Date ? canvas.createdAt.toISOString() : canvas.createdAt,
    updatedAt: new Date().toISOString(),
    // Ensure AI suggestions are plain objects
    keyPartners_ai_suggestions: canvas.keyPartners_ai_suggestions || [],
    keyActivities_ai_suggestions: canvas.keyActivities_ai_suggestions || [],
    valuePropositions_ai_suggestions: canvas.valuePropositions_ai_suggestions || [],
    customerRelationships_ai_suggestions: canvas.customerRelationships_ai_suggestions || [],
    channels_ai_suggestions: canvas.channels_ai_suggestions || [],
    customerSegments_ai_suggestions: canvas.customerSegments_ai_suggestions || [],
    keyResources_ai_suggestions: canvas.keyResources_ai_suggestions || [],
    costStructure_ai_suggestions: canvas.costStructure_ai_suggestions || [],
    revenueStreams_ai_suggestions: canvas.revenueStreams_ai_suggestions || []
  };
  return serialized;
};

// Add this helper function to deserialize data from Firestore
const deserializeCanvas = (data: any): BusinessModelCanvas => {
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    // Ensure AI suggestions are properly typed
    keyPartners_ai_suggestions: data.keyPartners_ai_suggestions || [],
    keyActivities_ai_suggestions: data.keyActivities_ai_suggestions || [],
    valuePropositions_ai_suggestions: data.valuePropositions_ai_suggestions || [],
    customerRelationships_ai_suggestions: data.customerRelationships_ai_suggestions || [],
    channels_ai_suggestions: data.channels_ai_suggestions || [],
    customerSegments_ai_suggestions: data.customerSegments_ai_suggestions || [],
    keyResources_ai_suggestions: data.keyResources_ai_suggestions || [],
    costStructure_ai_suggestions: data.costStructure_ai_suggestions || [],
    revenueStreams_ai_suggestions: data.revenueStreams_ai_suggestions || []
  };
};

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CanvasState>({
    currentCanvas: null,
    formData: initialCanvasState,
    status: 'idle',
    error: null
  });
  const [userCanvases, setUserCanvases] = useState<DocumentData[]>([]);
  
  const { user } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStatus = useCallback((status: CanvasState['status'], error: string | null = null) => {
    setState(prev => ({ ...prev, status, error }));
  }, []);

  const saveToFirebase = useCallback(async (data: BusinessModelCanvas) => {
    if (!user || !data.id) return;
    try {
      setStatus('saving');
      const serializedData = serializeCanvas(data);
      await updateDoc(doc(db, 'businessModelCanvases', data.id), serializedData);
      setStatus('idle');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to save');
    }
  }, [user, setStatus]);

  const updateField = useCallback((field: keyof BusinessModelCanvas, value: string) => {
    setState(prev => {
      const updatedData = {
        ...prev.formData,
        [field]: value,
        id: prev.currentCanvas?.id || prev.formData.id
      };
      saveToFirebase(updatedData);
      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const updateSection = useCallback((sectionKey: string, value: string[]) => {
    setState(prev => {
      const updatedData = {
        ...prev.formData,
        [sectionKey]: value,
        id: prev.currentCanvas?.id || prev.formData.id
      };
      saveToFirebase(updatedData);
      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const loadCanvas = useCallback(async (id: string) => {
    try {
      setStatus('loading');
      const canvasDoc = await getDoc(doc(db, 'businessModelCanvases', id));
      
      if (!canvasDoc.exists()) {
        throw new Error('Canvas not found');
      }

      const canvasData = deserializeCanvas({ ...canvasDoc.data(), id: canvasDoc.id });
      
      setState(prev => ({
        ...prev,
        currentCanvas: canvasData,
        formData: canvasData,
        status: 'idle',
        error: null,
      }));

      localStorage.setItem('lastCanvasId', id);
    } catch (err) {
      console.error('Error loading canvas:', err);
      setStatus('error', err instanceof Error ? err.message : 'Failed to load canvas');
    }
  }, [setStatus]);

  const createNewCanvas = async (data: { name: string, description: string }) => {
    if (!user) return;

    try {
      setStatus('saving');
      const newCanvas: BusinessModelCanvas = {
        ...initialCanvasState,
        companyName: data.name,
        companyDescription: data.description,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        date: new Date().toISOString().split('T')[0],
      };

      const docRef = await addDoc(collection(db, 'businessModelCanvases'), newCanvas);
      const canvasWithId = { ...newCanvas, id: docRef.id };
      
      setState(prev => ({
        ...prev,
        currentCanvas: canvasWithId,
        formData: canvasWithId,
        status: 'idle',
        error: null
      }));

      localStorage.setItem('lastCanvasId', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating new canvas:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to create canvas');
      throw error;
    }
  };

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: prev.currentCanvas || initialCanvasState,
      status: 'idle',
      error: null
    }));
  }, []);

  const deleteCanvas = useCallback(async (id: string) => {
    if (!user) return;

    try {
      setStatus('loading');
      await deleteDoc(doc(db, 'businessModelCanvases', id));
      
      // If we're deleting the current canvas, reset the state
      if (state.currentCanvas?.id === id) {
        setState(prev => ({
          ...prev,
          currentCanvas: null,
          formData: initialCanvasState,
          status: 'idle',
          error: null
        }));
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Error deleting canvas:', err);
      setStatus('error', err instanceof Error ? err.message : 'Failed to delete canvas');
    }
  }, [user, setStatus, state.currentCanvas?.id]);

  const clearState = useCallback(() => {
    setState({
      currentCanvas: null,
      formData: initialCanvasState,
      status: 'idle',
      error: null
    });
    localStorage.removeItem('lastCanvasId');
  }, []);

  useEffect(() => {
    const storedCanvasId = localStorage.getItem('lastCanvasId');
    if (storedCanvasId) {
      loadCanvas(storedCanvasId);
    }
  }, [loadCanvas]);

  useEffect(() => {
    let unsubscribeCanvases: (() => void) | undefined;

    if (user) {
      const canvasesQuery = query(
        collection(db, 'businessModelCanvases'),
        where('userId', '==', user.uid)
      );

      unsubscribeCanvases = onSnapshot(canvasesQuery, (snapshot: DocumentData) => {
        const canvases = snapshot.docs.map((doc: DocumentData) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserCanvases(canvases);
      });
    } else {
      setUserCanvases([]);
    }

    return () => {
      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }
    };
  }, [user]);

  return (
    <CanvasContext.Provider 
      value={{
        currentCanvas: state.currentCanvas,
        formData: state.formData,
        status: state.status,
        error: state.error,
        userCanvases,
        updateField,
        updateSection,
        loadCanvas,
        createNewCanvas,
        resetForm,
        deleteCanvas,
        clearState,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};