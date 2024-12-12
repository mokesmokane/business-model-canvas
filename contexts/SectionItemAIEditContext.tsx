import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Canvas, Section, SectionItem, AIAgent, AISuggestion } from '@/types/canvas';
import { getAuth } from 'firebase/auth';
  
interface SectionItemAIEditContextType {
  suggestion: string | null;
  status: string | null;
  requestSuggestions: (params: {
    currentContent: Canvas;
    section: string;
    item: SectionItem;
    instruction?: string;
  }) => Promise<void>;
  clearSuggestions: () => void;
  acceptSuggestion: (params: {
    currentContent: Canvas;
    section: string;
    item: SectionItem;
    newContent: string;
  }) => Promise<void>;
  rejectSuggestion: () => void;
}

const SectionItemAIEditContext = createContext<SectionItemAIEditContextType | undefined>(undefined);

export function useSectionItemAIEdit() {
  const context = useContext(SectionItemAIEditContext);
  if (!context) {
    throw new Error('useSectionItemAIEdit must be used within a SectionItemAIEditProvider');
  }
  return context;
}

interface SectionItemAIEditProviderProps {
  children: ReactNode;
}

export function SectionItemAIEditProvider({ children }: SectionItemAIEditProviderProps) {
  const [suggestion, setSuggestion] = useState<string|null>(null);
  const [status, setStatus] = useState<string|null>(null);

  const requestSuggestions = async ({
    currentContent,
    section,
    item,
    instruction,
  }: {
    currentContent: Canvas;
    section: string;
    item: SectionItem;
    instruction?: string;
  }) => {
    setStatus('Thinking');
    setSuggestion('');
    
    try {
      if (!instruction) {
        instruction = 'Edit the item to make it more complete and accurate.'
      }

      // Convert the Map to a regular object before stringifying
      const serializedContent = {
        ...currentContent,
        sections: Object.fromEntries(currentContent.sections)
      };

      const jsonBody = JSON.stringify({
        currentContent: serializedContent,
        section,
        item,
        instruction
      });
      
      // Get the current user's token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      const token = await user.getIdToken();

      const response = await fetch('/api/ai-item-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: jsonBody  
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI suggestions');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let accumulatedContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream complete');
            break;
          }

          // Decode and process the chunk
          const text = new TextDecoder().decode(value);
          accumulatedContent += text;
          
          // Update state with the new accumulated content
          setSuggestion(accumulatedContent);
        }
      } catch (streamError) {
        console.error('Error reading stream:', streamError);
        throw streamError;
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setSuggestion(null);
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setStatus(null);
    }
  };

  const clearSuggestions = () => {
    setSuggestion(null);
  };

  const acceptSuggestion = async ({
    currentContent,
    section,
    item,
    newContent,
  }: {
    currentContent: Canvas;
    section: string;
    item: SectionItem;
    newContent: string;
  }) => {
    clearSuggestions();
  };

  const rejectSuggestion = () => {
    clearSuggestions();
  };

  const value = {
    suggestion,
    status,
    requestSuggestions,
    clearSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  };

  return (
    <SectionItemAIEditContext.Provider value={value}>
      {children}
    </SectionItemAIEditContext.Provider>
  );
} 