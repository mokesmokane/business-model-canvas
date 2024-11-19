import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIItemAssistButton } from './AIItemAssistButton';
import { Edit2, Trash2 } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';

interface SectionItemProps {
  item: string;
  onDelete: () => void;
  isEditing: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  className: string;
}

export function SectionItem({
  item,
  onDelete,
  isEditing,
  isActive,
  isExpanded,
  onClick,
  onEditStart,
  onEditEnd,
  className,
}: SectionItemProps) {
  const { canvasTheme } = useCanvas();
  const showControls = isExpanded || isEditing;

  return (
    <Card
      canvasTheme={canvasTheme}
      className={`mb-2 p-3 transition-all duration-300 !bg-transparent relative ${
        isEditing ? 'border-primary/50 bg-primary/5 shadow-md' : ''
      } ${className}`}
      onClick={onClick}
    >
      <p className={`text-sm whitespace-pre-wrap mb-2 ${
        canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-100'
      }`}>
        {item}
      </p>

      <div
        className={`
         transition-all duration-500 ease-in-out 
          overflow-hidden
          ${showControls ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'} 
        `}
      >
        <div className="flex items-center space-x-2 mt-2 justify-end">
          <AIItemAssistButton
            section={item}
            sectionKey={item}
            onExpandSidebar={() => {}}
            onDropdownStateChange={() => {}}
          />
          <Button
            onClick={isEditing ? onEditEnd : onEditStart}
            size="sm"
            variant={isEditing ? "default" : "outline"}
            canvasTheme={canvasTheme}
            className={`flex items-center ${
              canvasTheme === 'light' 
                ? 'border-gray-200 hover:bg-gray-100'
                : 'hover:bg-gray-800'
            }`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onDelete}
            size="sm"
            variant="outline"
            canvasTheme={canvasTheme}
            className={`flex items-center ${
              canvasTheme === 'light' 
                ? 'border-gray-200 hover:bg-gray-100'
                : 'hover:bg-gray-800'
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default SectionItem;