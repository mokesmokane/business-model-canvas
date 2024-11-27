'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasType } from '@/types/canvas-sections';
import IconSelector from '@/app/components/IconSelector';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { VisualGridEditor } from '@/components/LayoutGrid/VisualGridEditor';
import { AIAgent } from '@/types/canvas';
import { AIAgentService } from '@/services/aiAgentService';
import { TAG_INFO } from '@/src/constants/tags';
import { TagSuggesterService } from '@/services/tagSuggesterService';
import DynamicIcon from '../Util/DynamicIcon';
import { Loader2, Pencil, Save, XIcon } from 'lucide-react';
import { aiAgentCreatorService } from '@/services/aiAgentCreatorService';
import { canvasTypeService } from '@/services/canvasTypeService';

function isValidGridTemplate(template: string): boolean {
  const validPattern = /^(\d+fr|\d+px|auto)(\s+(\d+fr|\d+px|auto))*$/;
  return validPattern.test(template);
}

interface CustomCanvasManagerProps {
  canvasTypeId: string;
  onClose: () => void;
}

export default function CustomCanvasManager({ canvasTypeId, onClose }: CustomCanvasManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null);
  const [defaultAreas, setDefaultAreas] = useState<string[]>([]);
  const [defaultCols, setDefaultCols] = useState<string>('');
  const [defaultRows, setDefaultRows] = useState<string>('');
  const [aiAgent, setAiAgent] = useState<AIAgent | null>(null);
  
  const aiAgentService = new AIAgentService();
  const tagSuggesterService = new TagSuggesterService();
  const { user } = useAuth();

  useEffect(() => {
    loadCanvasType();
  }, [canvasTypeId]);

  const loadCanvasType = async () => {
    setIsLoading(true);
    try {
      const loadedCanvasType = await canvasTypeService.getCanvasType(canvasTypeId);
      if (!loadedCanvasType) {
        throw new Error('Canvas type not found');
      }
      
      setCanvasType(loadedCanvasType);
      setDefaultAreas(loadedCanvasType.defaultLayout?.layout.areas || []);
      setDefaultCols(loadedCanvasType.defaultLayout?.layout.gridTemplate.columns || '');
      setDefaultRows(loadedCanvasType.defaultLayout?.layout.gridTemplate.rows || '');

      const agent = await aiAgentService.getAIAgent(canvasTypeId);
      setAiAgent(agent);
    } catch (err) {
      setError('Failed to load canvas type');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!canvasType || !user) return;
    
    setIsSaving(true);
    try {
      const updatedCanvasType = {
        ...canvasType,
        defaultLayout: {
          ...canvasType.defaultLayout!,
          layout: {
            ...canvasType.defaultLayout!.layout,
            areas: defaultAreas,
            gridTemplate: {
              columns: defaultCols,
              rows: defaultRows,
            },
          },
        },
      };

      await canvasTypeService.updateCustomCanvasType(updatedCanvasType);
      if (aiAgent) {
        await aiAgentService.updateAIAgent(canvasTypeId, aiAgent);
      }
      
      onClose();
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!canvasType) return null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="basic" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <DynamicIcon name={canvasType.icon} className="w-6 h-6 text-foreground" />
            </div>        
            <h3 className="text-2xl font-semibold text-foreground">Edit {canvasType.name}</h3>
          </div>

          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="ai">AI Agent</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              <XIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={saveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={canvasType.name}
                  onChange={(e) => setCanvasType({ ...canvasType, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={canvasType.description}
                  onChange={(e) => setCanvasType({ ...canvasType, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Icon</label>
                <TooltipProvider>
                  <IconSelector
                    value={canvasType.icon}
                    onChange={(icon) => setCanvasType({ ...canvasType, icon })}
                  />
                </TooltipProvider>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Button 
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const suggestedTags = await tagSuggesterService.getSuggestedTags({
                          name: canvasType.name,
                          description: canvasType.description,
                          sections: canvasType.sections
                        });
                        setCanvasType({ ...canvasType, tags: suggestedTags });
                      } catch (error) {
                        setError('Failed to fetch tag suggestions');
                        console.error(error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isLoading ? 'Suggesting...' : 'Suggest Tags'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TAG_INFO.map(({ name, color }) => {
                    const isSelected = canvasType.tags?.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          const currentTags = canvasType.tags || [];
                          const newTags = currentTags.includes(name)
                            ? currentTags.filter((t) => t !== name)
                            : [...currentTags, name];
                          setCanvasType({ ...canvasType, tags: newTags });
                        }}
                        className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          transition-colors duration-200
                          ${isSelected ? color : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                        `}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <VisualGridEditor
                initialAreas={defaultAreas}
                initialCols={defaultCols}
                initialRows={defaultRows}
                canvasType={canvasType}
                showGridAreas={true}
                onDeleteSection={(index) => {
                  const updatedSections = [...canvasType.sections];
                  updatedSections.splice(index, 1);
                  setCanvasType({ ...canvasType, sections: updatedSections });
                }}
                onAddSection={(newSection) => {
                  const updatedSections = [...canvasType.sections];
                  updatedSections.push(newSection);
                  setCanvasType({ ...canvasType, sections: updatedSections });
                }}
                onChange={(areas, cols, rows) => {
                  setDefaultAreas(areas);
                  setDefaultCols(cols);
                  setDefaultRows(rows);
                }}
                onUpdateSection={(updatedSection) => {
                  const updatedSections = [...canvasType.sections];
                  const index = updatedSections.findIndex(s => s.gridIndex === updatedSection.gridIndex);
                  if (index !== -1) {
                    updatedSections[index] = updatedSection;
                    setCanvasType({
                      ...canvasType,
                      sections: updatedSections
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Agent Configuration</span>
                <Button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const newAiAgent = await aiAgentCreatorService.createAIAgent(canvasType);
                      if (newAiAgent) {
                        setAiAgent(newAiAgent);
                      } else {
                        setError('No AI agent data received');
                      }
                    } catch (error) {
                      setError('Failed to fetch AI agent');
                      console.error(error);
                    } finally {
                      setIsLoading(false);
                    }
                  }} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Generate AI Agent'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={aiAgent?.name || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, name: e.target.value } : null)}
                  placeholder="AI Agent Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">System Prompt</label>
                <Textarea
                  value={aiAgent?.systemPrompt || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, systemPrompt: e.target.value } : null)}
                  placeholder="System Prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Question Prompt</label>
                <Textarea
                  value={aiAgent?.questionPrompt || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, questionPrompt: e.target.value } : null)}
                  placeholder="Question Prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Critique Prompt</label>
                <Textarea
                  value={aiAgent?.critiquePrompt || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, critiquePrompt: e.target.value } : null)}
                  placeholder="Critique Prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Research Prompt</label>
                <Textarea
                  value={aiAgent?.researchPrompt || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, researchPrompt: e.target.value } : null)}
                  placeholder="Research Prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Suggest Prompt</label>
                <Textarea
                  value={aiAgent?.suggestPrompt || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, suggestPrompt: e.target.value } : null)}
                  placeholder="Suggest Prompt"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Question Tool Description</label>
                <Textarea
                  value={aiAgent?.questionToolDescription || ''}
                  onChange={(e) => setAiAgent(aiAgent ? { ...aiAgent, questionToolDescription: e.target.value } : null)}
                  placeholder="Question Tool Description"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 