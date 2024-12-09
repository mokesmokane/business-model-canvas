import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { Canvas, TextSectionItem } from '@/types/canvas'
import { CanvasDocument, DocumentService } from '@/services/document'
import { v4 as uuidv4 } from 'uuid';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ProcessDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: CanvasDocument | null;
  canvas: Canvas;
  onProcessComplete: (updatedCanvas: Canvas) => void;
}

export function ProcessDocumentDialog({
  open,
  onOpenChange,
  document,
  canvas,
  onProcessComplete
}: ProcessDocumentDialogProps) {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const { hasAccessToProFeatures, isFreeUser } = useSubscription();

  const handleProcessDocument = async (doc: CanvasDocument | null) => {
    if (!doc || selectedSections.size === 0) return;
    console.log('handleProcessDocument', doc, selectedSections)
    setIsProcessing(true);
    try {
      const result = await DocumentService.processDocumentContent(
        doc.textContent,
        canvas.canvasType,
        Array.from(selectedSections)
      );
      
      const updatedSections = new Map(canvas.sections);
      
      result.forEach((section: any) => {
        const existingSection = updatedSections.get(section.sectionName);
        if (existingSection) {
          const newItems = section.items.map((item: any) => {
            return new TextSectionItem(
              uuidv4(),
              `${item.content}${item.rationale ? `\n\n${item.rationale}` : ''}`
            );
          });
          
          existingSection.sectionItems = [
            ...existingSection.sectionItems.filter(item => item !== undefined),
            ...newItems
          ];
          
          updatedSections.set(section.sectionName, existingSection);
        }
      });
      
      const updatedCanvas = {
        ...canvas,
        sections: updatedSections,
      };
      
      onProcessComplete(updatedCanvas);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Document Content</DialogTitle>
          <DialogDescription>
            Select which sections you'd like to populate with content from {document?.fileName}
          </DialogDescription>
        </DialogHeader>
        {isFreeUser && (
          <DialogDescription>
            You are currently in a free trial period. You can only process the first 3 pages of the document.
          </DialogDescription>
        )}
        <div className="space-y-4">
          {Array.from(canvas.sections.entries()).map(([sectionName, section]) => (
            <div key={sectionName} className="flex items-center space-x-2">
              <Checkbox
                id={sectionName}
                checked={selectedSections.has(sectionName)}
                onCheckedChange={(checked) => {
                  const newSelected = new Set(selectedSections);
                  if (checked) {
                    newSelected.add(sectionName);
                  } else {
                    newSelected.delete(sectionName);
                  }
                  setSelectedSections(newSelected);
                }}
              />
              <Label htmlFor={sectionName}>{sectionName}</Label>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleProcessDocument(document)}
            disabled={selectedSections.size === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Document'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 