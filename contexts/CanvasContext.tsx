'use client';

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
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
  keyPartners: '',
  keyActivities: '',
  valuePropositions: '',
  customerRelationships: '',
  channels: '',
  customerSegments: '',
  keyResources: '',
  costStructure: '',
  revenueStreams: '',
};

interface CanvasContextType {
  currentCanvas: BusinessModelCanvas | null;
  formData: BusinessModelCanvas;  
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  updateField: (field: keyof BusinessModelCanvas, value: string) => void;
  loadCanvas: (id: string) => Promise<void>;
  createNewCanvas: (data: { name: string, description: string }) => Promise<string | undefined>;
  resetForm: () => void;
  deleteCanvas: (id: string) => Promise<void>;
}

export const CanvasContext = createContext<CanvasContextType>({
  currentCanvas: null,
  formData: initialCanvasState,
  status: 'idle',
  error: null,
  updateField: () => {},
  loadCanvas: async () => {},
  createNewCanvas: async () => { return ''  },
  resetForm: () => {},
  deleteCanvas: async () => {},
});

const AUTOSAVE_DELAY = 1000;

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CanvasState>({
    currentCanvas: null,
    formData: initialCanvasState,
    status: 'idle',
    error: null
  });
  
  const { user } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStatus = useCallback((status: CanvasState['status'], error: string | null = null) => {
    setState(prev => ({ ...prev, status, error }));
  }, []);

  const saveToFirebase = useCallback(
    debounce(async (updatedData: BusinessModelCanvas) => {
      if (!user) return;

      try {
        setStatus('saving');
        const dataToSave = {
          ...updatedData,
          userId: user.uid,
          updatedAt: new Date(),
        };

        if (updatedData.id) {
          const { id, ...saveData } = dataToSave;
          if (!id) throw new Error('Canvas ID is required for updating');
          await updateDoc(
            doc(db, 'businessModelCanvases', id),
            saveData
          );
          setState(prev => ({
            ...prev,
            currentCanvas: dataToSave,
            status: 'idle'
          }));
        } else {
          const docRef = await addDoc(collection(db, 'businessModelCanvases'), {
            ...dataToSave,
            createdAt: new Date(),
          });
          const newData = { ...dataToSave, id: docRef.id };
          setState(prev => ({
            ...prev,
            currentCanvas: newData,
            formData: newData,
            status: 'idle'
          }));
        }
      } catch (err) {
        setStatus('error', err instanceof Error ? err.message : 'Failed to save canvas');
      }
    }, AUTOSAVE_DELAY),
    [user, setStatus]
  );

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

  const loadCanvas = useCallback(async (id: string) => {
    try {
      setStatus('loading');
      const canvasDoc = await getDoc(doc(db, 'businessModelCanvases', id));
      
      if (!canvasDoc.exists()) {
        throw new Error('Canvas not found');
      }

      const canvasData = canvasDoc.data() as BusinessModelCanvas;
      const canvasWithId = { ...canvasData, id: canvasDoc.id };
      
      setState(prev => ({
        ...prev,
        currentCanvas: canvasWithId,
        formData: canvasWithId,
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

  return (
    <CanvasContext.Provider 
      value={{
        currentCanvas: state.currentCanvas,
        formData: state.formData,
        status: state.status,
        error: state.error,
        updateField,
        loadCanvas,
        createNewCanvas,
        resetForm,
        deleteCanvas
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};