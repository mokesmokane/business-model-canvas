'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { Canvas, SectionItem, TextSectionItem } from '@/types/canvas';
import { useCanvas } from './CanvasContext';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
interface DocumentGenerationStatus {
  isGenerating: boolean;
  completedSections: string[];
  currentSection?: string;
  error?: string;
}

interface DocumentAiGenerationContextType {
  generationStatus: Record<string, DocumentGenerationStatus>;
  startGeneration: (params: {
    canvas: Canvas,
    selectedType: CanvasType,
    documentContent: string,
    fileName: string
  }) => Promise<void>;
  updateSectionStatus: (canvasId: string, sectionName: string, completed: boolean) => void;
  setError: (canvasId: string, error: string) => void;
  clearStatus: (canvasId: string) => void;
  cancelGeneration: (canvasId: string) => void;
}

const DocumentAiGenerationContext = createContext<DocumentAiGenerationContextType | undefined>(undefined);

export function DocumentAiGenerationProvider({ children }: { children: ReactNode }) {
  const [generationStatus, setGenerationStatus] = useState<Record<string, DocumentGenerationStatus>>({});
  const { updateSection, updateCanvas } = useCanvas();
  const { user } = useAuth();
  const startGeneration = async ({ canvas, selectedType, documentContent, fileName }: {
    canvas: Canvas,
    selectedType: CanvasType,
    documentContent: string,
    fileName: string
  }) => {
    setGenerationStatus(prev => ({
      ...prev,
      [canvas.id]: {
        isGenerating: true,
        completedSections: [],
      }
    }));

    try {
    const idToken = await user?.getIdToken()
    if (!idToken) throw new Error('No idToken');
      const response = await fetch('/api/ai-document-dive/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          pdfContent: documentContent,
          canvasType: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const sectionSuggestions = await response.json();

      // Process all sections' suggestions at once
      console.log('sectionSuggestions', sectionSuggestions)
      const updatedCanvas = { ...canvas };
      
      for (const section of sectionSuggestions) {
        try {
          console.log('section', section)
          updateSectionStatus(canvas.id, section.sectionName, false);
          
          const sectionItems: SectionItem[] = section.items.map((item: { content: string; rationale: string }) => {
            const content = item.content.trim();
            const isMarkdown = /[*_~`]/.test(content);
            const formattedContent = isMarkdown ? content : `**${content}**`;
            return new TextSectionItem(uuidv4(), `${formattedContent}\n\n${item.rationale.trim()}`);
          });

          // Check if the section exists in the canvas before including it in updates
          if (canvas.sections.has(section.sectionName)) {
            const existingSection = canvas.sections.get(section.sectionName);
            if (existingSection) {
              updatedCanvas.sections.set(section.sectionName, {
                ...existingSection,
                sectionItems
              });
            }
            updateSectionStatus(canvas.id, section.sectionName, true);
          } else {
            console.warn(`Section ${section.sectionName} not found in canvas`);
          }
        } catch (error) {
          console.error(`Error processing section ${section.sectionName}:`, error);
          setError(canvas.id, `Error processing section ${section.sectionName}`);
        }
      }

      // Apply all updates at once by updating the entire canvas
      if (updatedCanvas.sections.size > 0) {
        await updateCanvas(updatedCanvas);
        // Force a refresh of the canvas state
        updateSection('', []);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError(canvas.id, 'Failed to generate suggestions');
    } finally {
      setGenerationStatus(prev => ({
        ...prev,
        [canvas.id]: {
          ...prev[canvas.id],
          isGenerating: false,
          currentSection: undefined
        }
      }));
    }
  };

  const updateSectionStatus = (canvasId: string, sectionName: string, completed: boolean) => {
    setGenerationStatus(prev => {
      const status = prev[canvasId] || { isGenerating: true, completedSections: [] };
      return {
        ...prev,
        [canvasId]: {
          ...status,
          currentSection: completed ? undefined : sectionName,
          completedSections: completed 
            ? [...status.completedSections, sectionName]
            : status.completedSections
        }
      };
    });
  };

  const setError = (canvasId: string, error: string) => {
    setGenerationStatus(prev => ({
      ...prev,
      [canvasId]: {
        ...prev[canvasId],
        error,
        isGenerating: false
      }
    }));
  };

  const clearStatus = (canvasId: string) => {
    setGenerationStatus(prev => {
      const { [canvasId]: _, ...rest } = prev;
      return rest;
    });
  };

  const cancelGeneration = async (canvasId: string) => {
    try {
      setError(canvasId, "Generation cancelled");
      // Additional cleanup logic can go here
    } catch (error) {
      console.error('Failed to cancel generation:', error);
    }
  };

  return (
    <DocumentAiGenerationContext.Provider value={{
      generationStatus,
      startGeneration,
      updateSectionStatus,
      setError,
      clearStatus,
      cancelGeneration
    }}>
      {children}
    </DocumentAiGenerationContext.Provider>
  );
}

export function useDocumentAiGeneration() {
  const context = useContext(DocumentAiGenerationContext);
  if (context === undefined) {
    throw new Error('useDocumentAiGeneration must be used within a DocumentAiGenerationProvider');
  }
  return context;
} 