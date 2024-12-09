'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasType } from '@/types/canvas-sections';
import { NewCanvasTypeSuggestion, ExistingCanvasTypeSuggestion } from '@/app/api/ai-canvas-dive/types';
import { sendCreateCanvasTypeFromDiveRequest } from '@/services/aiCreateCanvasService';
import { useCanvas } from './CanvasContext';
import { Canvas, Section, SectionItem } from '@/types/canvas';
import { useAuth } from './AuthContext';

interface DiveSuggestionsContextType {
    existingSuggestions: CanvasType[];
    newSuggestions: NewCanvasTypeSuggestion[];
    statusMessage: string;
    selected: string | null;
    clearSuggestions: () => void;
    startDiveAnalysis: (params: {
        parentCanvas: any;
        folderId: string;
        section: { name: string; placeholder: string };
        item: string;
    }) => void;
    setExistingSuggestions: (suggestions: CanvasType[]) => void;
    setNewSuggestions: (suggestions: NewCanvasTypeSuggestion[]) => void;
    setSelected: (selected: string | null) => void;
    createNewCanvasType: (newCanvasType: NewCanvasTypeSuggestion) => void;
    createCanvas: (canvasType: CanvasType, parentCanvas: Canvas | null, section: Section, item: SectionItem) => Promise<Canvas | undefined>;
}

const DiveSuggestionsContext = createContext<DiveSuggestionsContextType | undefined>(undefined);

export function DiveSuggestionsProvider({ children }: { children: ReactNode }) {
    const [existingSuggestions, setExistingSuggestions] = useState<CanvasType[]>([]);
    const [newSuggestions, setNewSuggestions] = useState<NewCanvasTypeSuggestion[]>([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [folderId, setFolderId] = useState<string | null>(null);
    const { createNewCanvas } = useCanvas();
    const [selected, setSelected] = useState<string | null>(null);
    const { user } = useAuth();
    const clearSuggestions = () => {
        setExistingSuggestions([]);
        setNewSuggestions([]);
        setStatusMessage('');
    };

    async function getNameDescription(canvasType: CanvasType, section: Section, item: SectionItem) {
        const idToken = await user?.getIdToken()
        const messageEnvelope = {
            messageHistory: [
                {
                    role: 'user' as const,
                    content: `Here is the section to dig into: ${JSON.stringify(section)}
                `
                },
                {
                    role: 'user' as const,
                    content: `Here is the section item to dig into: ${JSON.stringify(item)}  
                `
                },
                {
                    role: 'user' as const,
                    content: 'lets create a canvas to dig into this'
                },
                {
                    role: 'assistant' as const,
                    content: `Here is the canvas type to use for this: ${JSON.stringify(canvasType)}`
                }
            ],
            newMessage: {
                role: 'user' as const,
                content: `lets name our new canvas and give it a description based off what we are digging into (${JSON.stringify(item)})`
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
            console.log('canvasType', canvasType)

            if (canvasType) {
                console.log('setting newSuggestions and existingSuggestions')
                setNewSuggestions([]);
                console.log('setting existingSuggestions')
                setExistingSuggestions([canvasType])
                console.log('done')
                setSelected(canvasType.id)
            }
        } catch (error) {
            console.error('Error in createNewCanvasType:', error);
            setStatusMessage('Error creating new canvas type');
        } finally {
            setStatusMessage('');
        }
    }

    async function startDiveAnalysis(params: {
        parentCanvas: any;
        folderId: string;
        section: { name: string; placeholder: string };
        item: string;
    }) {
        try {
            setFolderId(params.folderId);
            console.log('startDiveAnalysis')
            clearSuggestions();
            const idToken = await user?.getIdToken()

            // Handle existing canvas suggestions
            setStatusMessage('Exploring existing canvas types...');
            // Start both API calls concurrently
            const existingResponse = await
                fetch('/api/ai-canvas-dive/existing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify(params),
                })

            if (!existingResponse.ok) throw new Error('Failed to fetch existing suggestions');

            const existingData = await existingResponse.json();
            console.log('existingData', existingData)
            setExistingSuggestions(existingData.suggestions.map((suggestion: any) => {
                return {
                    ...suggestion.canvasType,
                    description: suggestion.rationale
                }
            }));

            setStatusMessage('Thinking of new canvas possibilities...');

            const newResponse = await fetch('/api/ai-canvas-dive/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(params),
            })

            if (!newResponse.ok) throw new Error('Failed to fetch new suggestions');
            const newData = await newResponse.json();
            console.log('newData', newData)
            setNewSuggestions(newData.suggestions);
            setStatusMessage('');
        } catch (error) {
            console.error('Error in dive analysis:', error);
            setStatusMessage('Error loading suggestions');
        } finally {
            setStatusMessage('');
        }
    };

    async function createCanvas(canvasType: CanvasType, parentCanvas: Canvas | null, section: Section, item: SectionItem) {
        const nameDescription = await getNameDescription(canvasType, section, item);

        const newCanvas = await createNewCanvas({
            name: nameDescription.name.trim(),
            description: nameDescription.description.trim(),
            canvasType: canvasType,
            layout: canvasType.defaultLayout?.layout,
            folderId: folderId || "root",
            parentCanvasId: parentCanvas?.id,
        })

        return newCanvas;
    }

    return (
        <DiveSuggestionsContext.Provider
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
        </DiveSuggestionsContext.Provider>
    );
}

export function useDiveSuggestions() {
    const context = useContext(DiveSuggestionsContext);
    if (context === undefined) {
        throw new Error('useDiveSuggestions must be used within a DiveSuggestionsProvider');
    }
    return context;
} 