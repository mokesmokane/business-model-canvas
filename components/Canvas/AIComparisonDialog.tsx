import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useMediaQuery } from '@/hooks/use-media-query';

interface AIComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  original: string;
  suggestion: string;
  onAccept: (editedSuggestion: string) => void;
  onReject: () => void;
  canvasTheme: 'light' | 'dark';
}

export const AIComparisonDialog: React.FC<AIComparisonDialogProps> = ({
  isOpen,
  onClose,
  original,
  suggestion,
  onAccept,
  onReject,
  canvasTheme,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState(suggestion);

  // Reset states when dialog closes or suggestion changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
    console.log('resetting', suggestion)
    setEditedSuggestion(suggestion);
  }, [isOpen, suggestion]);

  const content = (
    <>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
        <div>
          <h4 className="text-sm font-medium mb-2">Original</h4>
          <div className={`text-sm whitespace-pre-wrap p-3 rounded-md overflow-auto max-h-[40vh] ${
            canvasTheme === 'light' ? 'bg-gray-100' : 'bg-gray-800'
          }`}>
            <ReactMarkdown>{original}</ReactMarkdown>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">AI Suggestion</h4>
          <div 
            className={`text-sm p-3 rounded-md overflow-auto max-h-[40vh] ${
              canvasTheme === 'light' ? 'bg-blue-50' : 'bg-blue-900'
            } ${!isEditing && 'cursor-pointer'}`}
            onClick={() => !isEditing && setIsEditing(true)}
            role="button"
            tabIndex={0}
          >
            {isEditing ? (
              <textarea
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                className={`w-full h-full min-h-[inherit] bg-transparent text-sm font-inherit resize-none focus:outline-none`}
                style={{ height: '100%', minHeight: '200px' }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="whitespace-pre-wrap"
                onClick={() => setIsEditing(true)}
              >
                <ReactMarkdown>{editedSuggestion}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onReject();
            onClose();
          }}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
        <Button
          size="sm"
          onClick={() => {
            console.log('accepting', editedSuggestion)
            onAccept(editedSuggestion);
            onClose();
          }}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>AI Suggestion</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>AI Suggestion</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

