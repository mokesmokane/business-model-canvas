import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIItemAssistButton } from './AIItemAssistButton';
import { Edit2, Link, Trash2, Check, X } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';
import { SectionItem as SectionItemType, TextSectionItem } from '@/types/canvas';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown';
import { useSectionItemAIEdit } from '@/contexts/SectionItemAIEditContext';

interface SectionItemProps {
  item: SectionItemType;
  section: string;
  onDelete: () => void;
  isEditing: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onEditStart: () => void;
  onEditEnd: () => void;
  onDiveIn: (item: SectionItemType) => void;
  onDeleteLink: () => void;
  className: string;
}

export function SectionItem({
  item,
  section,
  onDelete,
  isEditing,
  isActive,
  isExpanded,
  onClick,
  onEditStart,
  onEditEnd,
  onDiveIn,
  onDeleteLink,
  className,
}: SectionItemProps) {
  const { loadCanvas, canvasTheme, hoveredItemId } = useCanvas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const showControls = isExpanded || isEditing;
  const sectionItem = item as TextSectionItem;
  const isHovered = hoveredItemId === item.id;
  const router = useRouter()
  const { suggestion, status, clearSuggestions, acceptSuggestion, rejectSuggestion } = useSectionItemAIEdit();
  const isAIEditing = status === 'Thinking' || suggestion !== null;

  const handleCanvasLink = async () => {
    try {
      const loaded = await loadCanvas(item.canvasLink!.canvasId)
      if (loaded) {
        localStorage.setItem('lastCanvasId', item.canvasLink!.canvasId)
        router.push(`/canvas/${item.canvasLink!.canvasId}`)
      } else {
        setIsDialogOpen(true)
      }
    } catch (error) {
      setIsDialogOpen(true)
    }
  }

  return (
    <Card
      canvasTheme={canvasTheme}
      className={`mb-2 p-3 transition-all duration-300 relative ${
        isEditing ? 'border-primary/50 bg-primary/5 shadow-md' : ''
      } ${
        isAIEditing ? 'border-blue-500/50 bg-blue-500/5 shadow-md' : ''
      } ${
        isHovered ? (canvasTheme === 'light' ? 'bg-gray-100' : 'bg-gray-900') : '!bg-transparent'
      } ${className}`}
      onClick={onClick}
    >
      {item.canvasLink && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1 right-1 p-1 !bg-transparent hover:!bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleCanvasLink}
        >
          <Link className="h-4 w-4" />
        </Button>
      )}
      <div className={`text-sm whitespace-pre-wrap mb-2 ${
        canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-100'
      }`}>
        <ReactMarkdown>
          {sectionItem.content}
        </ReactMarkdown>
      </div>

      {isAIEditing && (
        <div className="mt-4">
          {status === 'Thinking' && !suggestion && (
            <div className="text-sm text-muted-foreground animate-pulse">
              AI is thinking...
            </div>
          )}
          {suggestion !== null && (
            <>
              <div className="text-sm font-medium mb-2">Suggested Edit:</div>
              <div 
                className={`text-sm whitespace-pre-wrap mb-2 ${
                  canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-100'
                }`}
              >
                <ReactMarkdown>
                  {suggestion}
                </ReactMarkdown>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={rejectSuggestion}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // acceptSuggestion({
                    //   currentContent: item,
                    //   section,
                    //   item: sectionItem,
                    //   newContent: suggestion
                    // });
                  }}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
              </div>
            </>
          )}
        </div>
      )}

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
            content={sectionItem.content}
            section={section}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Canvas not found</DialogTitle>
            <DialogDescription>
              Do you want to delete the link?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDeleteLink();
                setIsDialogOpen(false);
              }}
              className="dark:bg-red-900 dark:hover:bg-red-800 dark:text-slate-100"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default SectionItem;