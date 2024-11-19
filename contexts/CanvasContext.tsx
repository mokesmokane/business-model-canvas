'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, DocumentData, onSnapshot, where, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import debounce from 'lodash/debounce';
import { AIQuestion, Canvas, SerializedCanvas, SerializedSections } from '@/types/canvas';
import { deleteDoc } from 'firebase/firestore';
import { CANVAS_LAYOUTS, CANVAS_TYPES, CanvasLayoutDetails, CanvasType, getInitialCanvasState } from '@/types/canvas-sections';

interface Section {
  name: string;
  items: string[];
  qAndAs: any[];
}

interface CanvasState {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
}


interface CanvasContextType {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  userCanvases: DocumentData[];
  canvasTheme: 'light' | 'dark';
  canvasType: CanvasType;
  canvasLayout: CanvasLayoutDetails;
  updateField: (field: keyof Canvas, value: string) => void;
  updateLayout: (layout: string[]) => void;
  updateLayoutType: (canvasTypeKey: string) => void;
  updateSection: (sectionKey: string, items: string[]) => void;
  updateQuestionAnswer: (sectionKey: string, question: AIQuestion) => void;
  loadCanvas: (id: string) => Promise<void>;
  createNewCanvas: (data: { name: string, description: string, canvasType?: string, layout?: string  }) => Promise<string | undefined>;
  resetForm: () => void;
  deleteCanvas: (id: string) => Promise<void>;
  clearState: () => void;
  updateQuestions: (sectionKey: string, questions: any[]) => void;
  setCanvasTheme: (theme: 'light' | 'dark') => void;
}

export const CanvasContext = createContext<CanvasContextType>({
  currentCanvas: null,
  formData: getInitialCanvasState(CANVAS_TYPES.businessModel, CANVAS_LAYOUTS.BUSINESS_MODEL),
  status: 'idle',
  error: null,
  userCanvases: [],
  canvasTheme: 'light',
  canvasType: CANVAS_TYPES.businessModel,
  canvasLayout: CANVAS_LAYOUTS.BUSINESS_MODEL,
  updateLayout: () => {}, 
  updateLayoutType: () => {},
  updateField: () => {},
  updateSection: () => {},
  updateQuestionAnswer: () => {},
  loadCanvas: async () => {},
  createNewCanvas: async () => { return '' },
  resetForm: () => {},
  deleteCanvas: async () => {},
  clearState: () => {},
  updateQuestions: () => {},
  setCanvasTheme: () => {},
});

const AUTOSAVE_DELAY = 1000;

// Add this helper function at the top of the file
const serializeCanvas = (canvas: Canvas): SerializedCanvas => {
  return {
    ...canvas,
    sections: serializeSections(canvas.sections),
    createdAt: canvas.createdAt?.toISOString(),
    updatedAt: canvas.updatedAt?.toISOString(),
  };
};

// Add this helper function to deserialize data from Firestore
const deserializeCanvas = (data: SerializedCanvas): Canvas => {
  return {
    ...data,
    sections: deserializeSections(data.sections),
    
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  };
};

// Helper functions for Map <-> Object conversion
const serializeSections = (sections: Map<string, Section>): SerializedSections => {
  return Object.fromEntries(sections);
};

const deserializeSections = (sections: SerializedSections): Map<string, Section> => {
  return new Map(Object.entries(sections));
};

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CanvasState>({
    currentCanvas: null,
    formData: getInitialCanvasState(CANVAS_TYPES.businessModel, CANVAS_LAYOUTS.BUSINESS_MODEL),
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

  const saveToFirebase = useCallback(async (data: Canvas) => {
    if (!user || !data.id) return;
    try {
      setStatus('saving');
      const serializedData = serializeCanvas(data);
      await updateDoc(doc(db, 'userCanvases', user.uid, 'canvases', data.id), serializedData as any);
      setStatus('idle');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to save');
    }
  }, [user, setStatus]);

  const updateField = useCallback((field: keyof Canvas, value: string) => {
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

  const updateSection = useCallback((sectionKey: string, items: string[]) => {
    setState(prev => {
      const sections = prev.formData.sections;
      if (!sections.has(sectionKey)) return prev;

      const section = sections.get(sectionKey);
      if (!section) return prev;

      const updatedSections = new Map(sections);
      updatedSections.set(sectionKey, {
        ...section,
        items: items
      });

      const updatedData = {
        ...prev.formData,
        sections: updatedSections,
        id: prev.currentCanvas?.id || prev.formData.id
      };

      // Before saving to Firebase, we need to serialize the Map
      const dataForFirebase = {
        ...updatedData,
        sections: deserializeSections(serializeSections(updatedData.sections))
      };
      
      saveToFirebase(dataForFirebase);

      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const loadCanvas = useCallback(async (id: string) => {
    console.log('loadCanvas', id);
    if (!user?.uid || !id) return;
    
    try {
      setStatus('loading');
      const canvasRef = doc(collection(db, 'userCanvases', user.uid, 'canvases'), id);
      const canvasDoc = await getDoc(canvasRef);
      
      if (!canvasDoc.exists()) {
        throw new Error('Canvas not found');
      }

      const canvasData = deserializeCanvas({ ...canvasDoc.data(), id: canvasDoc.id } as SerializedCanvas);
      
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
  }, [setStatus, user?.uid]);

  const createNewCanvas = async (data: { name: string, description: string, canvasType?: string, layout?: string }) => {
    if (!user) return;

    try {
      setStatus('saving');
      
      const now = new Date();
      const newCanvas = serializeCanvas({
        ...getInitialCanvasState(CANVAS_TYPES[data.canvasType || 'businessModel'], CANVAS_LAYOUTS[data.layout || 'BUSINESS_MODEL']),
        userId: user.uid,
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now
      });
      
      const docRef = await addDoc(collection(db, 'userCanvases', user.uid, 'canvases'), newCanvas);
      
      // Deserialize the canvas before setting state
      const canvasWithId = deserializeCanvas({
        ...newCanvas,
        id: docRef.id
      });
      
      setState(prev => ({
        ...prev,
        currentCanvas: canvasWithId,
        formData: canvasWithId,
        status: 'idle',
        error: null
      }));

      return docRef.id;
    } catch (error) {
      console.error('Error creating new canvas:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to create canvas');
      throw error;
    }
  };


  const updateQuestionAnswer = useCallback((sectionKey: string, question: AIQuestion) => {
    setState(prev => {
      const sections = prev.formData.sections;
      const section = sections.get(sectionKey);
      if (!section) return prev;

      const updatedSections = new Map(sections);
      updatedSections.set(sectionKey, {
        ...section,
        qAndAs: [...section.qAndAs, question]
      });

      const updatedData = {
        ...prev.formData,
        sections: updatedSections,
        id: prev.currentCanvas?.id || prev.formData.id
      };

      // Before saving to Firebase, we need to serialize the Map
      const dataForFirebase = {
        ...updatedData,
        sections: deserializeSections(serializeSections(updatedData.sections))
      };
      
      saveToFirebase(dataForFirebase);

      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: prev.currentCanvas || getInitialCanvasState(CANVAS_TYPES.businessModel, CANVAS_LAYOUTS.BUSINESS_MODEL),
      status: 'idle',
      error: null
    }));
  }, []);

  const deleteCanvas = useCallback(async (id: string) => {
    if (!user) return;

    try {
      setStatus('loading');
      await deleteDoc(doc(db, 'userCanvases', user.uid, 'canvases', id));
      
      // If we're deleting the current canvas, reset the state
      if (state.currentCanvas?.id === id) {
        setState(prev => ({
          ...prev,
          currentCanvas: null,
          formData: getInitialCanvasState(CANVAS_TYPES.businessModel, CANVAS_LAYOUTS.BUSINESS_MODEL),
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
      formData: getInitialCanvasState(CANVAS_TYPES.businessModel, CANVAS_LAYOUTS.BUSINESS_MODEL),
      status: 'idle',
      error: null
    });
    localStorage.removeItem('lastCanvasId');
  }, []);

  const updateQuestions = useCallback((sectionKey: string, questions: any[]) => {
    setState(prev => {
      const updatedSections = new Map(prev.formData.sections);
      const section = updatedSections.get(sectionKey);
      if (section) {
        section.qAndAs = questions;
        updatedSections.set(sectionKey, section);
        
        const updatedData = {
          ...prev.formData,
          sections: updatedSections,
          id: prev.currentCanvas?.id || prev.formData.id
        };

        // Save to Firebase
        saveToFirebase(updatedData);

        return {
          ...prev,
          formData: updatedData
        };
      }
      return prev;
    });
  }, [saveToFirebase]);

  const setCanvasTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => {
      const updatedData = {
        ...prev.formData,
        theme,
        id: prev.currentCanvas?.id || prev.formData.id
      };
      saveToFirebase(updatedData);
      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

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
        collection(db, 'userCanvases', user.uid, 'canvases'),
        where('userId', '==', user.uid)
      );

      unsubscribeCanvases = onSnapshot(canvasesQuery, (snapshot: DocumentData) => {
        const canvases = snapshot.docs.map((doc: DocumentData) => {
          const data = deserializeCanvas({ ...doc.data(), id: doc.id } as SerializedCanvas);
          return {
            id: doc.id,
            ...data
          };
        });
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
  
  const updateLayout = useCallback((layout: string[]) => {
    setState(prev => {
      const updatedData = {
        ...prev.formData,
        canvasLayout: layout,
      };
      // Save to Firebase
      saveToFirebase(updatedData);
      
      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const updateLayoutType = useCallback((layoutTypeKey: string) => {
    console.log('updateLayoutType',layoutTypeKey);
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, canvasLayoutKey: layoutTypeKey }
    }));
  }, []);

  const canvasType = CANVAS_TYPES[state.formData.canvasTypeKey || 'businessModel'];
  const canvasLayout = CANVAS_LAYOUTS[state.formData.canvasLayoutKey || 'businessModel'];

  return (
    <CanvasContext.Provider 
      value={{
        currentCanvas: state.currentCanvas,
        formData: state.formData,
        status: state.status,
        error: state.error,
        userCanvases,
        canvasTheme: state.formData.theme || 'light',
        canvasType,
        canvasLayout,
        updateField,
        updateLayout,
        updateLayoutType,
        updateSection,
        updateQuestionAnswer,
        loadCanvas,
        createNewCanvas,
        resetForm,
        deleteCanvas,
        clearState,
        updateQuestions,
        setCanvasTheme,
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