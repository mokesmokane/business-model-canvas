'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, DocumentData, onSnapshot, where, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import debounce from 'lodash/debounce';
import { AIAgent, AIQuestion, Canvas, CanvasItem, SectionItem, SerializedCanvas, SerializedSections } from '@/types/canvas';
import { deleteDoc } from 'firebase/firestore';
import { BUSINESS_MODEL_LAYOUT, CanvasLayout, CanvasLayoutDetails, CanvasType, getInitialCanvasState } from '@/types/canvas-sections';
import { AIAgentService } from '@/services/aiAgentService';
import { useCanvasFolders } from './CanvasFoldersContext';
import { v4 as uuidv4 } from 'uuid';
import { canvasService } from '@/services/canvasService';
import { deserializeCanvas, serializeCanvas, deserializeSections, serializeSections } from '@/services/canvasService';
import { useAIAgents } from './AIAgentContext';
import { useCanvasContext } from './ContextEnabledContext';
import { sendNameDescriptionRequest } from '@/services/aiCreateCanvasService';
import { Message, MessageEnvelope } from './ChatContext';

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
  canvasType: CanvasType | null;
  canvasLayout: CanvasLayout | null;
  updateField: (field: keyof Canvas, value: string) => void;
  updateLayout: (layout: string[], canvasLayout: CanvasLayout) => void;
  updateSection: (sectionKey: string, items: SectionItem[]) => void;
  updateItem: (sectionKey: string, item: SectionItem) => Promise<void>;
  updateQuestionAnswer: (question: AIQuestion) => void;
  loadCanvas: (id: string) => Promise<boolean>;
  createNewCanvas: (data: { name: string, description: string, canvasType: CanvasType, folderId: string, layout?: CanvasLayout, parentCanvasId?: string}) => Promise<Canvas | undefined>;
  createNewCanvasAndNameIt: (data: { canvasType: CanvasType, folderId: string, parentCanvasId?: string, messageHistory: Message[]}) => Promise<Canvas | undefined>;
  resetForm: () => void;
  deleteCanvas: (id: string) => Promise<void>;
  clearState: () => void;
  updateQuestions: (sectionKey: string, questions: any[]) => void;
  setCanvasTheme: (theme: 'light' | 'dark') => void;
  hoveredItemId: string | null;
  setHoveredItemId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const CanvasContext = createContext<CanvasContextType>({
  currentCanvas: null,
  formData: null,
  status: 'idle',
  error: null,
  userCanvases: [],
  canvasTheme: 'light',
  canvasType: null,
  canvasLayout: null,
  updateLayout: () => { },
  updateField: () => { },
  updateSection: () => { },
  updateItem: () => { return Promise.resolve() },
  updateQuestionAnswer: () => { },
  loadCanvas: async () => { return false },
  createNewCanvas: async () => { return undefined },
  createNewCanvasAndNameIt: async () => { return undefined },
  resetForm: () => { },
  deleteCanvas: async () => { },
  clearState: () => { },
  updateQuestions: () => { },
  setCanvasTheme: () => { },
  hoveredItemId: null,
  setHoveredItemId: () => { },
});

  const AUTOSAVE_DELAY = 1000;
  export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CanvasState | null>(null);
  const { onCanvasCreated, rootFolderId } = useCanvasFolders()
  const [userCanvases, setUserCanvases] = useState<DocumentData[]>([]);
  const { setIsContextEnabled } = useCanvasContext()
  const { user, hasProFeatures } = useAuth();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

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
    if (!user) return;
    
    try {
      setStatus('saving');
      const canvasRef = doc(collection(db, 'userCanvases', user.uid, 'canvases'), data.id);
      
      // Serialize the data before saving
      const serializedData = serializeCanvas(data);
      
      await setDoc(canvasRef, serializedData);
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

  const updateItem = useCallback(async (sectionKey: string, item: SectionItem) => {
    console.log('updateItem', sectionKey, item)
    
    // First, prepare the updated data outside of setState
    const updatedData = await new Promise((resolve, reject) => {
      setState(prev => {
        if(!prev) {
          reject(new Error('No previous state'));
          return null;
        }
        console.log('prev', prev)
        const sections = prev.formData.sections;
        const section = sections.get(sectionKey);
        console.log('section', section)
        if (!section) {
          reject(new Error('Section not found'));
          return prev;
        }
        console.log('section.sectionItems', section.sectionItems)
        
        const updatedSections = new Map(sections);
        const existingItem = section.sectionItems?.find(i => i.id === item.id);
        console.log('existingItem', existingItem)
        if (existingItem) {
          const updatedItems = section.sectionItems?.map(i => i.id === item.id ? item : i);
          updatedSections.set(sectionKey, {
            ...section,
            sectionItems: updatedItems
          });
          console.log('updatedSections', updatedSections)
        } else {
          section.sectionItems?.push(item);
          console.log('updatedSections', updatedSections)
        }

        const updatedData = {
          ...prev.formData,
          sections: updatedSections,
          id: prev.currentCanvas?.id || prev.formData.id
        };

        console.log('updatedData', updatedData)
        resolve(updatedData);
        
        return {
          ...prev,
          formData: updatedData
        };
      });
    });
    console.log('updatedData', updatedData)
    // Then wait for Firebase save to complete
    await saveToFirebase(updatedData as Canvas);
    console.log('updatedData saved')
    // Finally, wait for React to complete the state update
    return new Promise<void>(resolve => {
      // Use requestAnimationFrame to ensure we're after React's next render
      requestAnimationFrame(() => {
        // Add a small delay to ensure state has updated
        setTimeout(resolve, 0);
      });
    });
  }, [saveToFirebase]);

  const updateSection = useCallback((sectionKey: string, items: SectionItem[]) => {
    console.log('updateSection', sectionKey, items)
    setState(prev => {
      if(!prev) {
        console.log('prev is null')
        return null
      }
      const sections = prev.formData.sections;
      console.log('sections', sections)
      if (!sections.has(sectionKey)) return prev;
      
      const section = sections.get(sectionKey);
      console.log('section', section)
      if (!section) return prev;

      const updatedSections = new Map(sections);
      console.log('updatedSections', updatedSections)
      updatedSections.set(sectionKey, {
        ...section,
        sectionItems: items
      });
      console.log('updatedSections', updatedSections)
      const updatedData = {
        ...prev.formData,
        sections: updatedSections,
        id: prev.currentCanvas?.id || prev.formData.id
      };
      console.log('updatedData', updatedData)
      // Before saving to Firebase, we need to serialize the Map
      const dataForFirebase = {
        ...updatedData,
        sections: deserializeSections(serializeSections(updatedData.sections))
      };
      console.log('dataForFirebase', dataForFirebase)
      saveToFirebase(dataForFirebase);

      return {
        ...prev,
        formData: updatedData
      };
    });
  }, [saveToFirebase]);

  const loadCanvas = useCallback(async (id: string) => {  
    
    if (!user?.uid || !id) return false;
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
          return {
            currentCanvas: canvasData,
            formData: canvasData,
            status: 'idle',
            error: null
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
      return false;
    }
    return true;
  }, [setStatus, user?.uid]);

  
  const createNewCanvasAndNameIt = async (data: { 
    canvasType: CanvasType, 
    folderId: string,
    parentCanvasId?: string,
    messageHistory: Message[],
  }) => {
    let name = 'New Canvas'
    let description = ''
    if (!user) return;
      if(hasProFeatures) {
        const env: MessageEnvelope = {
          messageHistory: data.messageHistory,
          newMessage: {
            type: 'text',
            role: 'user',
            content: 'Please suggest a name and description for the new canvas'
          }
        }   
        const nameDescription = await sendNameDescriptionRequest(env)
        name = nameDescription.name
        description = nameDescription.description
      }
    const canvas = await createNewCanvas({
      name,
      description,
      ...data
    })
    return canvas
  }

  const createNewCanvas = async (data: { 
    name: string, 
    description: string, 
    canvasType: CanvasType, 
    folderId: string,
    parentCanvasId?: string,
  }) => {
    if (!user) return;

    try {
      setStatus('saving');
      // Remove parentCanvasId if it's undefined
      const cleanData = {
        ...data,
        parentCanvasId: data.parentCanvasId || null // Convert undefined to null
      };
      const canvas = await canvasService.createNewCanvas(cleanData);
      return canvas;
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

  return (
    <CanvasContext.Provider
      value={{
        currentCanvas: state?.currentCanvas || null,
        formData: state?.formData || null,
        status: state?.status || 'idle',
        error: state?.error || null,
        userCanvases,
        canvasTheme: state?.formData?.theme || 'light',
        canvasType: state?.formData?.canvasType || null,
        canvasLayout: state?.formData?.canvasLayout || null,
        updateField,
        updateLayout,
        updateSection,
        updateItem,
        updateQuestionAnswer,
        loadCanvas,
        createNewCanvas,
        createNewCanvasAndNameIt,
        resetForm,
        deleteCanvas,
        clearState,
        updateQuestions,
        setCanvasTheme,
        hoveredItemId,
        setHoveredItemId,
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