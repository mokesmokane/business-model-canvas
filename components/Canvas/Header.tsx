import React, { ChangeEvent, useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyEditDialog } from './CompanyEditDialog'
import { Canvas, TextSectionItem, Section, SectionItem } from '@/types/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import { Grid2x2, Moon, Sun, Printer, ExternalLink, ArrowUpRight, ArrowDownRight, ArrowRight, FileText, Upload, Loader2, Minimize2, Maximize2, Eye, EyeOff } from 'lucide-react'
import LayoutEditor from './LayoutEditor'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react'
import DynamicIcon from '../Util/DynamicIcon'
import { useCanvasContext } from '@/contexts/ContextEnabledContext'
import { CanvasDocument, DocumentService } from '@/services/document'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from 'uuid';
import { ProcessDocumentDialog } from './ProcessDocumentDialog'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface HeaderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header() {
  const { canvasTheme, formData, updateField, setCanvasTheme, updateCanvas, viewMode, setViewMode, showInputs, setShowInputs } = useCanvas();
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const { setHoveredItemId } = useCanvas();
  const router = useRouter();
  const [documents, setDocuments] = useState<CanvasDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<CanvasDocument | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<CanvasDocument | null>(null);
  const { hasAccessToProFeatures, isFreeUser } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  if (!formData) return null;

  useEffect(() => {
    if (formData?.id) {
      loadDocuments();
    }
  }, [formData?.id, formData?.name]);

  useEffect(() => {
    const checkPendingDocument = () => {
      const pendingDocString = localStorage.getItem('pendingDocument');
      if (pendingDocString && formData?.id) {
        try {
          const pendingDoc = JSON.parse(pendingDocString);
          if (pendingDoc.canvasId === formData.id) {
            setPendingDocument({
              textContent: pendingDoc.textContent,
              fileName: pendingDoc.fileName,
              id: uuidv4(),
              pageCount: 1,
              size: 0,
              uploadedAt: new Date(),
              contentType: 'application/pdf',
            } as CanvasDocument);
            setShowProcessDialog(true);
            // Clear the pending document
            localStorage.removeItem('pendingDocument');
          }
        } catch (error) {
          console.error('Error parsing pending document:', error);
        }
      }
    };

    // Check immediately and then every 1 second
    checkPendingDocument();
    const intervalId = setInterval(checkPendingDocument, 1000);

    // Stop checking after 5 seconds
    const timeoutId = setTimeout(() => clearInterval(intervalId), 5000);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [formData?.id]);

  const loadDocuments = async () => {
    console.log('loadDocuments', formData?.id, user?.uid)
    if (!formData?.id || !user?.uid) return;
    try {
      const docs = await DocumentService.getCanvasDocuments(user.uid, formData.id);
      console.log('docs', docs)
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !formData?.id) return;

    setIsUploadingDoc(true);
    try {
      const maxPages = isFreeUser ? 3 : undefined;
      const uploadedDoc = await DocumentService.uploadAndProcess(file, formData.id, maxPages);
      await loadDocuments();
      // setUploadedDocument(uploadedDoc);
      setShowDocumentDialog(true);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleProcessDocument = async (doc: CanvasDocument | null) => {
    if (!doc || selectedSections.size === 0) return;
    console.log('handleProcessDocument', doc, selectedSections)
    setIsProcessing(true);
    try {
      const result = await DocumentService.processDocumentContent(
        doc.textContent,
        formData.canvasType,
        Array.from(selectedSections)
      );
      
      console.log('API Result:', result);
      
      // Create a new Map to hold the updated sections
      const updatedSections = new Map(formData.sections);
      
      result.forEach((section: any) => {
        console.log('Processing section:', {
          sectionName: section.sectionName,
          items: section.items
        });
        
        const existingSection = updatedSections.get(section.sectionName);
        console.log('Found existing section:', existingSection);
        
        if (existingSection) {
          const items = section.items.map((item: any) => {
            return new TextSectionItem(uuidv4(), `${item.content}\n\n${item.rationale}`);
          });
          const newItems = items
            .filter((item: any) => {
              console.log('Filtering item:', item);
              return item && item.id && item.content;
            })
            .map((item: any) => {
              console.log('Creating TextSectionItem from:', item);
              const newItem = new TextSectionItem(
                item.id,
                `${item.content || ''}${item.rationale ? `\n\n${item.rationale}` : ''}`
              );
              console.log('Created new item:', newItem);
              return newItem;
            });
          
          console.log('New items to add:', newItems);
          console.log('Existing items:', existingSection.sectionItems);
          
          // Ensure we're not adding any undefined items
          existingSection.sectionItems = [
            ...existingSection.sectionItems.filter(item => item !== undefined),
            ...newItems
          ];
          
          console.log('Updated section items:', existingSection.sectionItems);
          updatedSections.set(section.sectionName, existingSection);
        }
      });
      
      // Create a new formData object with the updated sections
      const updatedFormData = {
        ...formData,
        sections: updatedSections,
        id: formData.id || '',
        name: formData.name || '',
        description: formData.description || '',
        canvasType: formData.canvasType,
        designedFor: formData.designedFor || '',
        designedBy: formData.designedBy || '',
        date: formData.date || '',
        version: formData.version || '',
        parentCanvasId: formData.parentCanvasId || null
      };
      
      console.log('Final updatedFormData:', {
        sections: Array.from(updatedFormData.sections.entries())
      });
      
      updateCanvas(updatedFormData);
      
      setShowDocumentDialog(false);
      setSelectedSections(new Set());
      setUploadedDocument(null);
    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField(event.target.id as keyof Canvas, event.target.value)
  }

  function getChildCanvases(formData: Canvas) {
    return Array.from(formData.sections.values())
      .flatMap(section => 
        section.sectionItems?.filter(item => item.canvasLink) || []
      );
  }

  function findSectionForItem(itemId: string): [string, Section] | undefined {
    return Array.from(formData!.sections.entries())
      .find(([_, section]) => 
        section.sectionItems.some(item => item.id === itemId)
      );
  }

  const handleParentCanvasClick = () => {
    if (formData?.parentCanvasId) {
      localStorage.setItem('lastCanvasId', formData.parentCanvasId)
      router.push(`/canvas/${formData.parentCanvasId}`)
    }
  }

  const handleLinkedCanvasClick = (canvasId: string) => {
    localStorage.setItem('lastCanvasId', canvasId)
    router.push(`/canvas/${canvasId}`)
  }

  return (
    <>
      <div className={`flex items-center justify-between p-4 border-b ${
        canvasTheme === 'light' 
          ? 'bg-white border-gray-200 text-black'
          : 'bg-gray-950 border-gray-800 text-white'
      }`}>
        <div className="flex items-center gap-4">
          <h1 className={`text-3xl font-bold tracking-tight ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}>
            {formData?.canvasType?.name || ''}
          </h1>
          <div className="flex items-center gap-2">
            <Input 
              canvasTheme={canvasTheme}
              value={formData?.name || ''}
              className={`max-w-[200px] ${
                canvasTheme === 'light' ? 'text-black' : 'text-white'
              }`}
              readOnly
            />
            <div className={`${!formData?.name || !formData?.description ? 
              'animate-pulse ring-2 ring-blue-500 rounded-md ring-opacity-75 shadow-lg shadow-blue-500/50' : ''}`}>
              <CompanyEditDialog/>
            </div>

            {formData?.parentCanvasId && (
              <Button
                onClick={handleParentCanvasClick}
                variant="outline"
                className={`flex items-center gap-1 text-sm ${
                  canvasTheme === 'light'
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <span>Parent Canvas</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            id="designedFor"
            canvasTheme={canvasTheme}
            className={`max-w-[150px] ${
              canvasTheme === 'light' 
                ? 'text-black bg-white border-gray-200' 
                : 'text-white bg-gray-950 border-gray-800'
            }`}
            type="text"
            placeholder="Designed For"
            value={formData?.designedFor || ''}
            onChange={onInputChange}
          />
          <Input
            id="designedBy"
            canvasTheme={canvasTheme}
            className={`max-w-[150px] ${
              canvasTheme === 'light' 
                ? 'text-black bg-white border-gray-200' 
                : 'text-white bg-gray-950 border-gray-800'
            }`}
            type="text"
            placeholder="Designed By"
            value={formData?.designedBy || ''}
            onChange={onInputChange}
          />
          <Input
            id="date"
            canvasTheme={canvasTheme}
            className={`max-w-[150px] ${
              canvasTheme === 'light' 
                ? 'text-black bg-white border-gray-200' 
                : 'text-white bg-gray-950 border-gray-800'
            }`}
            type="date"
            placeholder="Date"
            value={formData?.date || ''}
            onChange={onInputChange}
          />
          <Input
            id="version"
            canvasTheme={canvasTheme}
            className={`max-w-[150px] ${
              canvasTheme === 'light' 
                ? 'text-black bg-white border-gray-200' 
                : 'text-white bg-gray-950 border-gray-800'
            }`}
            type="text"
            placeholder="Version"
            value={formData?.version || ''}
            onChange={onInputChange}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`${
                  canvasTheme === 'light'
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" canvasTheme={canvasTheme}>
            <DropdownMenuItem key="screenshot" onClick={() => router.push(`/canvas/${formData.id}/screenshot`)}>
                <Printer className="h-4 w-4 mr-2" />
                Print View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>View Options</DropdownMenuLabel>

              <DropdownMenuItem key="layout-editor" onClick={() => setShowLayoutEditor(true)}>
                <Grid2x2 className="h-4 w-4 mr-2" />
                Layout Editor
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setViewMode(viewMode === 'fit-screen' ? 'fit-content' : 'fit-screen')} 
              >
                {viewMode === 'fit-screen' ? (
                  <>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Fit To Content
                  </>
                ) : (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Fit To Screen
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}>
                {canvasTheme === 'light' ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowInputs(!showInputs)}>
                {showInputs ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Inputs
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Inputs
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {(formData?.parentCanvasId || getChildCanvases(formData).length > 0) && (
                <>
                  <DropdownMenuLabel>Linked Canvases</DropdownMenuLabel>
                  {formData?.parentCanvasId && (
                    <DropdownMenuItem 
                      onClick={handleParentCanvasClick}
                      canvasTheme={canvasTheme}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Parent Canvas
                    </DropdownMenuItem>
                  )}
                  
                  {getChildCanvases(formData).length > 0 && (
                    <>
                      {getChildCanvases(formData).map((item, index) => {
                        const [sectionName, _] = findSectionForItem(item.id) || [];
                        
                        return (
                          <DropdownMenuItem 
                            key={`child-canvas-${item.id}`}
                            canvasTheme={canvasTheme}
                            onClick={() => {
                              localStorage.setItem('lastCanvasId', item.canvasLink!.canvasId)
                              router.push(`/canvas/${item.canvasLink!.canvasId}`)
                            }}
                            onMouseEnter={() => setHoveredItemId(item.id)}
                            onMouseLeave={() => setHoveredItemId(null)}
                            className="flex items-center gap-2"
                          >
                            <ArrowDownRight className="h-4 w-4 mr-2" />
                            <div className="flex flex-col flex-1">
                              {sectionName && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <DynamicIcon 
                                    name={formData.canvasType?.sections.find(section => section.name === sectionName)?.icon || 'Square'} 
                                    className="h-3 w-3" 
                                  /> 
                                  {sectionName}
                                </span>
                              )}
                              <span className="line-clamp-1">
                                {item instanceof TextSectionItem ? item.content : `Child Canvas ${index + 1}`}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuLabel className="flex items-center justify-between">
                Documents
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => {
                    if (!hasAccessToProFeatures) {
                      setShowUpgradeDialog(true);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </DropdownMenuLabel>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
              />

              {isUploadingDoc && (
                <DropdownMenuItem disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </DropdownMenuItem>
              )}

              {documents.length > 0 ? (
                documents.map((doc) => (
                  <DropdownMenuItem
                    key={doc.fileName}
                    onClick={() => {
                      setUploadedDocument(doc);
                      setShowDocumentDialog(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm">{doc.fileName}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.pageCount} pages</span>
                        <span>•</span>
                        <span>{Math.round(doc.size / 1024)}KB</span>
                        {doc.uploadedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">No documents</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <LayoutEditor 
          open={showLayoutEditor} 
          onOpenChange={setShowLayoutEditor}
        />
        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Document Content</DialogTitle>
              <DialogDescription>
                Select which sections you'd like to populate with content from {uploadedDocument?.fileName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {Array.from(formData.sections.entries()).map(([sectionName, section]) => (
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
                onClick={() => setShowDocumentDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleProcessDocument(uploadedDocument)}
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
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade to Pro</DialogTitle>
              <DialogDescription>
                Uploading and analyzing documents is a Pro feature.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => router.push('/pricing')}>
              Upgrade
            </Button>
          </DialogContent>
        </Dialog>
        <ProcessDocumentDialog
          open={showProcessDialog}
          onOpenChange={setShowProcessDialog}
          document={pendingDocument}
          canvas={formData}
          onProcessComplete={(updatedCanvas) => {
            updateCanvas(updatedCanvas);
            setPendingDocument(null);
          }}
        />
      </div>
    </>
  )
} 