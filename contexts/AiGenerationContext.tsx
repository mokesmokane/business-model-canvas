'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { Canvas, SectionItem, TextSectionItem } from '@/types/canvas';
import { generateSectionSuggestions } from '@/services/aiCreateCanvasService';
import { useCanvas } from './CanvasContext';
import { v4 as uuidv4 } from 'uuid';
interface GenerationStatus {
  isGenerating: boolean;
  completedSections: string[];
  currentSection?: string;
  error?: string;
}

interface AiGenerationContextType {
  generationStatus: Record<string, GenerationStatus>;
  startGeneration: (params: {
    canvas: Canvas,
    selectedType: CanvasType,
    parentCanvas: Canvas,
    diveItem: SectionItem
  }) => Promise<void>;
  updateSectionStatus: (canvasId: string, sectionName: string, completed: boolean) => void;
  setError: (canvasId: string, error: string) => void;
  clearStatus: (canvasId: string) => void;
  cancelGeneration: (canvasId: string) => void;
}

const AiGenerationContext = createContext<AiGenerationContextType | undefined>(undefined);

export function AiGenerationProvider({ children }: { children: ReactNode }) {
  const [generationStatus, setGenerationStatus] = useState<Record<string, GenerationStatus>>({});
  const canvasContext = useCanvas();
  const { updateSection } = canvasContext;

  const startGeneration = async ({ canvas, selectedType, parentCanvas, diveItem }: {
    canvas: Canvas,
    selectedType: CanvasType,
    parentCanvas: Canvas,
    diveItem: SectionItem
  }) => {
    setGenerationStatus(prev => ({
      ...prev,
      [canvas.id]: {
        isGenerating: true,
        completedSections: [],
      }
    }));

    const sections = selectedType.sections;
    
    for (const section of sections) {
      try {
        updateSectionStatus(canvas.id, section.name, false);

        const suggestions = await generateSectionSuggestions({
          parentCanvas,
          newCanvas: canvas,
          diveItem,
          sectionToGenerate: section
        });

        const sectionItems = suggestions.map((s: { content: string; rationale: string }) => {
          const content = s.content.trim();
          const isMarkdown = /[*_~`]/.test(content);
          const formattedContent = isMarkdown ? content : `**${content}**`;
          return new TextSectionItem(uuidv4(), `${formattedContent}\n\n${s.rationale.trim()}`);
        });
        console.log('Current canvas state:', canvas);
        updateSection(section.name, sectionItems);
        
        updateSectionStatus(canvas.id, section.name, true);
        console.log('completed section', section.name);
      } catch (error) {
        console.error(`Error generating suggestions for section ${section.name}:`, error);
        setError(canvas.id, `Error generating suggestions for ${section.name}`);
      }
    }

    updateSectionStatus(canvas.id, 'Overview', true);
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
    <AiGenerationContext.Provider value={{
      generationStatus,
      startGeneration,
      updateSectionStatus,
      setError,
      clearStatus,
      cancelGeneration
    }}>
      {children}
    </AiGenerationContext.Provider>
  );
}

export function useAiGeneration() {
  const context = useContext(AiGenerationContext);
  if (context === undefined) {
    throw new Error('useAiGeneration must be used within an AiGenerationProvider');
  }
  return context;
} 