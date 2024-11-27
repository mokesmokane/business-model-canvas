'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, DocumentData, onSnapshot, where, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import debounce from 'lodash/debounce';
import { AIAgent, AIQuestion, Canvas, CanvasItem, SerializedCanvas, SerializedSections } from '@/types/canvas';
import { deleteDoc } from 'firebase/firestore';
import { BUSINESS_MODEL_LAYOUT, CanvasLayout, CanvasLayoutDetails, CanvasType, getInitialCanvasState } from '@/types/canvas-sections';
import { AIAgentService } from '@/services/aiAgentService';
import { useCanvasFolders } from './CanvasFoldersContext';
import { v4 as uuidv4 } from 'uuid';
import { canvasService } from '@/services/canvasService';
import { deserializeCanvas, serializeCanvas, deserializeSections, serializeSections } from '@/services/canvasService';
import { useAIAgents } from './AIAgentContext';
import { useChat } from './ChatContext';

interface Section {
  name: string;
  items: string[];
  qAndAs: any[];
}

interface CanvasState {
  currentCanvas: Canvas ;
  formData: Canvas ;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
}


interface CanvasContextType {
  currentCanvas: Canvas | null;
  formData: Canvas | null;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  userCanvases: DocumentData[];
  canvasTheme: 'light' | 'dark';
  aiAgent: AIAgent | null;
  canvasType: CanvasType | null;
  canvasLayout: CanvasLayout | null;
  updateField: (field: keyof Canvas, value: string) => void;
  updateLayout: (layout: string[], canvasLayout: CanvasLayout) => void;
  updateSection: (sectionKey: string, items: string[]) => void;
  updateQuestionAnswer: (question: AIQuestion) => void;
  loadCanvas: (id: string) => Promise<void>;
  createNewCanvas: (data: { name: string, description: string, canvasType: CanvasType, folderId: string, layout?: CanvasLayout }) => Promise<string | undefined>;
  resetForm: () => void;
  deleteCanvas: (id: string) => Promise<void>;
  clearState: () => void;
  updateQuestions: (sectionKey: string, questions: any[]) => void;
  setCanvasTheme: (theme: 'light' | 'dark') => void;
}

export const CanvasContext = createContext<CanvasContextType>({
  currentCanvas: null,
  formData: null,
  status: 'idle',
  error: null,
  userCanvases: [],
  canvasTheme: 'light',
  aiAgent: null,
  canvasType: null,
  canvasLayout: null,
  updateLayout: () => { },
  updateField: () => { },
  updateSection: () => { },
  updateQuestionAnswer: () => { },
  loadCanvas: async () => { },
  createNewCanvas: async () => { return '' },
  resetForm: () => { },
  deleteCanvas: async () => { },
  clearState: () => { },
  updateQuestions: () => { },
  setCanvasTheme: () => { },
});

  const AUTOSAVE_DELAY = 1000;
  export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CanvasState | null>(null);
  const { onCanvasCreated, rootFolderId } = useCanvasFolders()
  const [userCanvases, setUserCanvases] = useState<DocumentData[]>([]);
  const { agentCache } = useAIAgents();
  const [aiAgent, setAiAgent] = useState<AIAgent | null>(null);
  const { isContextEnabled, setIsContextEnabled } = useChat()

  const { user } = useAuth();

  // Initialize canvasService when user changes
  useEffect(() => {
    if (user?.uid) {
      canvasService.initialize(user.uid);
    } else {
      canvasService.reset();
    }
  }, [user?.uid]);

  if (!user) {
    return null;
  }
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStatus = useCallback((status: CanvasState['status'], error: string | null = null) => {
    setState(prev => {
      if(!prev) {
        return null
      }
      return { ...prev, status, error }
    });
  }, []);

  const saveToFirebase = useCallback(async (data: Canvas) => {
    if (!user || !data.id) return;
    try {
      setStatus('saving');
      const serializedData = serializeCanvas({
        ...data,
        updatedAt: new Date()
      });
      await updateDoc(doc(db, 'userCanvases', user.uid, 'canvases', data.id), serializedData as any);
      setStatus('idle');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to save');
    }
  }, [user, setStatus]);

  const updateField = useCallback((field: keyof Canvas, value: string) => {
    setState(prev => {
      if(!prev) {
        return null
      }
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
      if(!prev) {
        return null
      }
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
    
    if (!user?.uid || !id) return;
    console.log('loadCanvas', id)
    setIsContextEnabled(true)
    try {
      setStatus('loading');
      const canvasRef = doc(collection(db, 'userCanvases', user.uid, 'canvases'), id);
      const canvasDoc = await getDoc(canvasRef);

      if (!canvasDoc.exists()) {
        throw new Error('Canvas not found');
      }

      const canvasData = deserializeCanvas({ ...canvasDoc.data(), id: canvasDoc.id } as SerializedCanvas);

      setState(prev => {
        if(!prev) {
          const aiAgent = agentCache[canvasData.canvasType.id]
          return {
            currentCanvas: canvasData,
            formData: canvasData,
            status: 'idle',
            error: null,
            aiAgent: aiAgent
          }
        }
        return {
          ...prev,
          currentCanvas: canvasData,
          formData: canvasData,
          status: 'idle',
          error: null,
        }
      });
      localStorage.setItem('lastCanvasId', id);
    } catch (err) {
      console.error('Error loading canvas:', err);
      setStatus('error', err instanceof Error ? err.message : 'Failed to load canvas');
    }
  }, [setStatus, user?.uid]);

  // Update createNewCanvas to use the singleton
  const createNewCanvas = async (data: { 
    name: string, 
    description: string, 
    canvasType: CanvasType, 
    folderId: string 
  }) => {
    if (!user) return;

    try {

      setStatus('saving');
      const canvasId = await canvasService.createNewCanvas(data);
      await loadCanvas(canvasId);
      return canvasId;
    } catch (error) {
      console.error('Error creating new canvas:', error);
      setStatus('error', error instanceof Error ? error.message : 'Failed to create canvas');
      throw error;
    }
  };

  const updateQuestionAnswer = useCallback((question: AIQuestion) => {
    
    setState(prev => {
      if(!prev) {
        return null
      }
      const sections = prev.formData.sections;
      const section = sections.get(question.section);
      if (!section) return prev;

      const updatedSections = new Map(sections);
      updatedSections.set(question.section, {
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
    setState(null);
  }, []);

  const deleteCanvas = useCallback(async (id: string) => {
    if (!user) return;

    try {
      setStatus('loading');
      await deleteDoc(doc(db, 'userCanvases', user.uid, 'canvases', id));

      // If we're deleting the current canvas, reset the state
      if (state?.currentCanvas?.id === id) {
        setState(null);
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Error deleting canvas:', err);
      setStatus('error', err instanceof Error ? err.message : 'Failed to delete canvas');
    } 
  }, [user, setStatus, state?.currentCanvas?.id]);

  const clearState = useCallback(() => {
    setState(null);
    localStorage.removeItem('lastCanvasId');
  }, []);

  const updateQuestions = useCallback((sectionKey: string, questions: any[]) => {
    setState(prev => {
      if(!prev) {
        return null
      }
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
      if(!prev) {
        return null
      }
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

  // useEffect(() => {
  //   const storedCanvasId = localStorage.getItem('lastCanvasId');
  //   if (storedCanvasId) {
  //     loadCanvas(storedCanvasId);
  //   }
  // }, [loadCanvas]);

  useEffect(() => {
    let unsubscribeCanvases: (() => void) | undefined;

    if (user) {
      const canvasesQuery = query(
        collection(db, 'userCanvases', user.uid, 'canvases')
      );

      unsubscribeCanvases = onSnapshot(canvasesQuery, async (snapshot: DocumentData) => {
        const canvases = snapshot.docs.map((doc: DocumentData) => {
          console.log('doc', doc)
          const data = deserializeCanvas({ ...doc.data(), id: doc.id } as SerializedCanvas);
          return {
            ...data,
            id: doc.id
          };
        });
        console.log('canvases', canvases)
        setUserCanvases(canvases);

        // Check for canvases without folders and add them to root
        for (const canvas of canvases) {
          const canvasItem: CanvasItem = {
            id: canvas.id,
            name: canvas.name,
            canvasTypeId: canvas.canvasType.id
          };

          // Check if canvas exists in any folder
          const foldersRef = collection(db, 'userFolders', user.uid, 'folders');
          const foldersSnapshot = await getDocs(foldersRef);
          let foundInFolder = false;

          for (const folderDoc of foldersSnapshot.docs) {
            const folderData = folderDoc.data();
            if (folderData.canvases && folderData.canvases[canvas.id]) {
              foundInFolder = true;
              break;
            }
          }

          // If not found in any folder, add to root folder
          if (!foundInFolder) {
            await onCanvasCreated(canvasItem, rootFolderId);
          }
        }
      });
    } else {
      setUserCanvases([]);
    }

    return () => {
      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }
    };
  }, [user, onCanvasCreated, rootFolderId]);

  const updateLayout = useCallback((layout: string[], canvasLayout: CanvasLayout) => {
    setState(prev => {
      if(!prev) {
        return null
      }
      //layout is the new order of the sections

      const sections = new Map(prev.formData.sections);

      // Update gridIndex for each section
      sections.forEach((section, key) => {
        const index = layout.indexOf(key);
        sections.set(key, {
          ...section,
          gridIndex: index
        });
      });

      const updatedData = {
        ...prev.formData,
        sections: sections,
        canvasLayout: canvasLayout
      };

      // Save to Firebase
      saveToFirebase(updatedData);

      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const setNewCanvas = useCallback(() => {
    clearState();
    setState(prev => {
      if(!prev) {
        return null
      }
      return {
      ...prev,
        newCanvas: true
      }
    });
  }, []);

  const canvasType = state?.formData?.canvasType
  const canvasLayout = state?.formData?.canvasLayout

  // Add new effect to subscribe to AI agent updates
  useEffect(() => {
    if (!state?.formData?.canvasType?.id) return;

    // Create reference to AI agent document
    const aiAgentRef = doc(db, "aiAgents", state.formData.canvasType.id);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(aiAgentRef, (snapshot) => {
      if (snapshot.exists()) {
        setState(prev => {
          if(!prev) {
            return null
          }
          return {
            ...prev,
            aiAgent: { ...snapshot.data() } as AIAgent
          }
        });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [state?.formData?.canvasType?.id]);

  // Add effect to sync aiAgent with agentCache
  useEffect(() => {
    if (state?.formData?.canvasType?.id) {
      const agent = agentCache[state.formData.canvasType.id];
      setAiAgent(agent || null);
    }
  }, [agentCache, state?.formData?.canvasType?.id]);

  return (
    <CanvasContext.Provider
      value={{
        currentCanvas: state?.currentCanvas || null,
        formData: state?.formData || null,
        status: state?.status || 'idle',
        error: state?.error || null,
        userCanvases,
        canvasTheme: state?.formData?.theme || 'light',
        aiAgent: aiAgent,
        canvasType: state?.formData?.canvasType || null,
        canvasLayout: state?.formData?.canvasLayout || null,
        updateField,
        updateLayout,
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