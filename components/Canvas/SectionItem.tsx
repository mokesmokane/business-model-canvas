import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIItemAssistButton } from './AIItemAssistButton';
import { Edit2, Link, Trash2 } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';
import { SectionItem as SectionItemType, TextSectionItem } from '@/types/canvas';
interface SectionItemProps {
  item: SectionItemType;
  onDelete: () => void;
  isEditing: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  onDiveIn: (item: SectionItemType) => void;
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
  onDiveIn,
  className,
}: SectionItemProps) {
  const { loadCanvas, canvasTheme } = useCanvas();
  const showControls = isExpanded || isEditing;
  const sectionItem = item as TextSectionItem;
  console.log('item', JSON.stringify(item, null, 2))
  console.log('sectionItem', JSON.stringify(sectionItem, null, 2))
  return (
    <Card
      canvasTheme={canvasTheme}
      className={`mb-2 p-3 transition-all duration-300 !bg-transparent relative ${
        isEditing ? 'border-primary/50 bg-primary/5 shadow-md' : ''
      } ${className}`}
      onClick={onClick}
    >
      {item.canvasLink && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1 right-1 p-1 !bg-transparent hover:!bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => {
            loadCanvas(item.canvasLink!.canvasId);
            localStorage.setItem('lastCanvasLink', item.canvasLink!.canvasId);
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
      )}
      <p className={`text-sm whitespace-pre-wrap mb-2 ${
        canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-100'
      }`}>
        {sectionItem.content}
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
            item={item}
            sectionName={sectionItem.content}
            onExpandSidebar={() => {}}
            onDropdownStateChange={() => {}}
            onDiveIn={() => onDiveIn(sectionItem)}
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