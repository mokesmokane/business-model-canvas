'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CanvasType } from "@/types/canvas-sections"
import { useTheme } from "next-themes"
import DynamicIcon from "./Util/DynamicIcon"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { Bot, Loader2 } from "lucide-react"
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasTypeCardTags } from "./CanvasTypeCards/CanvasTypeCardTags"
import { sendCreateCanvasTypeFromDiveRequest } from "@/services/aiCreateCanvasService"
import { SectionItem as SectionItemType, TextSectionItem } from "@/types/canvas"
import { ExistingCanvasDiveResponse, ExistingCanvasTypeSuggestion, NewCanvasDiveResponse, NewCanvasTypeSuggestion } from "@/app/api/ai-canvas-dive/types"
import { useDiveSuggestions } from '@/contexts/DiveSuggestionsContext';

interface CanvasDiveSelectorProps {
  section: {
    id: string;
    name: string;
    placeholder: string;
  };
  item: SectionItemType;
  onClose: () => void;
  onSuccess: (canvasId: string) => void;
}

export function CanvasDiveSelector({ section, item, onClose, onSuccess }: CanvasDiveSelectorProps) {
  const { theme } = useTheme();
  const { formData } = useCanvas();
  const { canvasTypes } = useCanvasTypes();
  const [isCreating, setIsCreating] = useState(false);
  const [createdCanvasType, setCreatedCanvasType] = useState<CanvasType | null>(null);
  const { selected, setSelected } = useDiveSuggestions();
  const {
    existingSuggestions,
    newSuggestions,
    statusMessage,
    createNewCanvasType,
    createCanvas,
    setExistingSuggestions,
    setNewSuggestions,
  } = useDiveSuggestions();

  const renderContent = () => {
    return (
      <>
        <div className="relative flex flex-wrap gap-6 w-full justify-center p-6">
          <AnimatePresence>
            {existingSuggestions.map((ct) => (
              <CanvasTypeCardTags
                key={ct.id}
                type={ct}
                isSelected={selected === ct.id}
                onClick={() => setSelected(ct.id)}
                // theme={theme}
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center w-full px-6">
          <div className="flex flex-row gap-6">
            {selected === null && newSuggestions.map((newCanvasType) => {
              if (createdCanvasType) return null;
              
              return (
                <motion.div
                  key={newCanvasType.name}
                  initial={{ opacity: 0, y: 20, scale: 1 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-[300px] p-6 rounded-lg border border-border bg-card hover:border-primary/50 cursor-pointer group"
                  onClick={async () => {
                    try {
                      createNewCanvasType(newCanvasType);
                    } catch (error) {
                      console.error('Error creating canvas:', error);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <DynamicIcon name={newCanvasType.icon} className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold">{newCanvasType.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                    {newCanvasType.rationale}
                  </p>
                  <div className="absolute top-[72px] inset-x-6 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {newCanvasType.sections.map((section) => (
                      <div 
                        key={section.name} 
                        className="inline-block text-xs font-medium py-1 px-3 bg-gray-200 rounded-full text-gray-700"
                      >
                        {section.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        {selected && (
          <div className="flex justify-center gap-4 w-full mt-4">
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={async () => {
                const canvasId = await createCanvas(false, existingSuggestions.find((ct) => ct.id === selected) || existingSuggestions[0],);
                if(canvasId) onSuccess(canvasId);
                onClose();
              }}
            >
              Create Canvas
            </button>
            <button
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={async () => {
                const canvasId = await createCanvas(true, existingSuggestions.find((ct) => ct.id === selected) || existingSuggestions[0]);
                console.log('canvasId', canvasId);
                if(canvasId) onSuccess(canvasId);
                onClose();
              }}
            >
              Create with Suggestions
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden rounded-md">
      <div className="flex-none text-center space-y-4 w-full p-8">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dive Deeper
          </h2>
          <p className="text-muted-foreground">
            Based on your item "{(item as TextSectionItem).content}" from the {section.name} section, here are some suggested canvases to explore further.
          </p>
          <div className="flex flex-col items-center justify-center flex-1 p-12">
          {statusMessage && (
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              <div className="relative">
              <span className="text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text bg-[length:200%_100%] animate-shimmer">
                {statusMessage}
                </span>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
} 