'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { NewCanvasTypeSuggestion } from '@/app/api/ai-canvas-dive/types';
import { sendCreateCanvasTypeFromDiveRequest } from '@/services/aiCreateCanvasService';
import { useCanvas } from './CanvasContext';
import { Canvas } from '@/types/canvas';
import { DocumentDiveInRequest } from '@/app/api/ai-document-dive/types';
import { useAuth } from './AuthContext';

interface DocumentDiveSuggestionsContextType {
    existingSuggestions: CanvasType[];
    newSuggestions: NewCanvasTypeSuggestion[];
    statusMessage: string;
    selected: string | null;
    clearSuggestions: () => void;
    startDiveAnalysis: (
        textContent: string,
        fileName: string
    ) => void;
    setExistingSuggestions: (suggestions: CanvasType[]) => void;
    setNewSuggestions: (suggestions: NewCanvasTypeSuggestion[]) => void;
    setSelected: (selected: string | null) => void;
    createNewCanvasType: (newCanvasType: NewCanvasTypeSuggestion) => void;
    createCanvas: (canvasType: CanvasType, content: string, fileName: string, folderId: string | null, canvasId: string | null) => Promise<Canvas | undefined>;
}

const DocumentDiveSuggestionsContext = createContext<DocumentDiveSuggestionsContextType | undefined>(undefined);

export function DocumentDiveSuggestionsProvider({ children }: { children: ReactNode }) {
    const [existingSuggestions, setExistingSuggestions] = useState<CanvasType[]>([]);
    const [newSuggestions, setNewSuggestions] = useState<NewCanvasTypeSuggestion[]>([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [folderId, setFolderId] = useState<string | null>(null);
    const { createNewCanvas, updateCanvas } = useCanvas();
    const { user } = useAuth();
    const [selected, setSelected] = useState<string | null>(null);

    const clearSuggestions = () => {
        setExistingSuggestions([]);
        setNewSuggestions([]);
        setStatusMessage('');
    };

    async function getNameDescription(canvasType: CanvasType, content: string, fileName: string) {
        const idToken = await user?.getIdToken()
        const messageEnvelope = {
            messageHistory: [
                {
                    role: 'user' as const,
                    content: `Here is the document content to analyze: ${content}
                    Filename: ${fileName}`
                },
                {
                    role: 'assistant' as const,
                    content: `Here is the canvas type to use for this: ${JSON.stringify(canvasType)}`
                }
            ],
            newMessage: {
                role: 'user' as const,
                content: `lets name our new canvas and give it a description based on the document content`
            }
        };

        const response = await fetch('/api/ai-name-description', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ messageEnvelope }),
        })

        let data = await response.json()
        return data
    }

    async function createNewCanvasType(newCanvasType: NewCanvasTypeSuggestion) {
        try {
            const idToken = await user?.getIdToken()
            if (!idToken) throw new Error('No idToken');
            setStatusMessage('Creating new canvas type...');
            setExistingSuggestions([]);
            setNewSuggestions([newCanvasType]);
            
            const messageEnvelope = {
                messageHistory: [],
                newMessage: {
                    type: 'text' as const,
                    role: 'user' as const,
                    content: JSON.stringify(newCanvasType)
                },
                action: 'suggestCanvasTypes'
            };

            const canvasType = await sendCreateCanvasTypeFromDiveRequest(messageEnvelope, idToken);

            if (canvasType) {
                setNewSuggestions([]);
                setExistingSuggestions([canvasType])
                setSelected(canvasType.id)
            }
        } catch (error) {
            console.error('Error in createNewCanvasType:', error);
            setStatusMessage('Error creating new canvas type');
        } finally {
            setStatusMessage('');
        }
    }

    async function startDiveAnalysis(documentText: string, fileName: string) {
        try {
            clearSuggestions();

            setStatusMessage('Exploring existing canvas types...');

            const idToken = await user?.getIdToken()
            if (!idToken) throw new Error('No idToken');

            const existingResponse = await fetch('/api/ai-document-dive/existing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ documentText, fileName } as DocumentDiveInRequest),
            })

            if (!existingResponse.ok) throw new Error('Failed to fetch existing suggestions');

            const existingData = await existingResponse.json();
            setExistingSuggestions(existingData.suggestions.map((suggestion: any) => ({
                ...suggestion.canvasType,
                description: suggestion.rationale
            })));

            setStatusMessage('Thinking of new canvas possibilities...');

            const newResponse = await fetch('/api/ai-document-dive/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ documentText, fileName } as DocumentDiveInRequest),
            })

            if (!newResponse.ok) throw new Error('Failed to fetch new suggestions');
            const newData = await newResponse.json();
            setNewSuggestions(newData.suggestions);
        } catch (error) {
            console.error('Error in dive analysis:', error);
            setStatusMessage('Error loading suggestions');
        } finally {
            setStatusMessage('');
        }
    };

    async function createCanvas(canvasType: CanvasType, content: string, fileName: string, folderId: string | null, canvasId: string | null) {
        const newCanvas = await createNewCanvas({
            name: canvasType.name,
            description: "",
            canvasType: canvasType,
            layout: canvasType.defaultLayout?.layout,
            folderId: folderId || "root",
            canvasId: canvasId,
        });

        if (!newCanvas) return;

        const nameDescription = await getNameDescription(canvasType, content, fileName);

        await updateCanvas({
            ...newCanvas,
            name: nameDescription.name.trim(),
            description: nameDescription.description.trim(),
        });

        return newCanvas;
    }

    return (
        <DocumentDiveSuggestionsContext.Provider
            value={{
                existingSuggestions,
                newSuggestions,
                statusMessage,
                selected,
                setSelected,
                clearSuggestions,
                startDiveAnalysis,
                setExistingSuggestions,
                setNewSuggestions,
                createNewCanvasType,
                createCanvas
            }}
        >
            {children}
        </DocumentDiveSuggestionsContext.Provider>
    );
}

export function useDocumentDiveSuggestions() {
    const context = useContext(DocumentDiveSuggestionsContext);
    if (context === undefined) {
        throw new Error('useDocumentDiveSuggestions must be used within a DocumentDiveSuggestionsProvider');
    }
    return context;
} 