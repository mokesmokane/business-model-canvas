'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasTypeService } from '@/services/canvasTypeService';
import { CanvasType, CanvasSection } from '@/types/canvas-sections';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Plus, Trash2, Pencil } from 'lucide-react';
import IconSelector from '@/app/components/IconSelector';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { VisualGridEditor } from '@/components/LayoutGrid/VisualGridEditor';
import { AIAgent } from '@/types/canvas';
import { AIAgentService } from '@/services/aiAgentService';
import { TAG_INFO } from '@/src/constants/tags';
import { TagSuggesterService } from '@/services/tagSuggesterService';
import { canvasTypeService } from '@/services/canvasTypeService';
import { db } from '@/lib/firebase';

function isValidGridTemplate(template: string): boolean {
  const validPattern = /^(\d+fr|\d+px|auto)(\s+(\d+fr|\d+px|auto))*$/;
  return validPattern.test(template);
}

export default function TabbedEditCanvasTypePage() {
  const { isAdminUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null);
  const [defaultAreas, setDefaultAreas] = useState<string[]>([]);
  const [defaultCols, setDefaultCols] = useState<string>('');
  const [defaultRows, setDefaultRows] = useState<string>('');
  const [aiAgent, setAiAgent] = useState<AIAgent | null>(null);
  const aiAgentService = new AIAgentService();
  const [loading, setLoading] = useState<boolean>(false);
  const tagSuggesterService = new TagSuggesterService();
  const { user } = useAuth();
  useEffect(() => {
    if (!isAdminUser) {
      router.push('/');
      return;
    }

    loadCanvasType();
    loadAiAgent();
  }, [isAdminUser, router]);

  const loadCanvasType = async () => {
    try {
      const typeId = params.id as string;
      const type = await canvasTypeService.getCanvasType(typeId);
      setCanvasType(type);
      setDefaultAreas(type?.defaultLayout?.layout.areas || []);
      setDefaultCols(type?.defaultLayout?.layout.gridTemplate.columns || '');
      setDefaultRows(type?.defaultLayout?.layout.gridTemplate.rows || '');
    } catch (err) {
      setError('Failed to load canvas type');
      console.error(err);
    }
  };

  const loadAiAgent = async () => {
    const agent = await aiAgentService.getAIAgent(params.id as string);
    setAiAgent(agent);
  }

  const handleSave = async () => {
    if (!canvasType) return;

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

    try {
      await canvasTypeService.updateCanvasType(params.id as string, updatedCanvasType);
      if (aiAgent) {
        await aiAgentService.updateAIAgent(params.id as string, aiAgent);
      }
      router.push('/admin');
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    }
  };

  const handleSectionReorder = (result: any) => {
    if (!result.destination || !canvasType) return;

    const sections = Array.from(canvasType.sections);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);

    // Update gridIndex values
    const updatedSections = sections.map((section, index) => ({
      ...section,
      gridIndex: index
    }));

    setCanvasType({
      ...canvasType,
      sections: updatedSections
    });
  };

  const fetchSuggestedAIAgent = async () => {
    const idToken = await user?.getIdToken()
    setLoading(true);
    try {
      const response = await fetch('/api/ai-agent-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ canvasType }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI agent');
      }

      const data = await response.json();
      if (data.aiAgent) {
        setAiAgent(data.aiAgent);
      } else {
        setError('No AI agent data received');
      }
    } catch (error) {
      setError('Failed to fetch AI agent');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedTags = async () => {
    setLoading(true);
    try {
      const suggestedTags = await tagSuggesterService.getSuggestedTags({
        name: canvasType!.name,
        description: canvasType!.description,
        sections: canvasType!.sections
      });
      
      setCanvasType({ ...canvasType!, tags: suggestedTags });
    } catch (error) {
      setError('Failed to fetch tag suggestions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (!canvasType) return null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Canvas Type</h1>
        <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="ai">AI Agent</TabsTrigger>
        </TabsList>
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Default Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Grid Columns</label>
              <Input
                value={defaultCols}
                onChange={(e) => setDefaultCols(e.target.value)}
                placeholder="Grid Columns (e.g., 1fr 1fr 1fr)"
              />
              {!isValidGridTemplate(defaultCols) && (
                <p className="text-red-500 text-sm">Invalid syntax: Please use a valid grid template format.</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Grid Rows</label>
              <Input
                value={defaultRows}
                onChange={(e) => setDefaultRows(e.target.value)}
                placeholder="Grid Rows (e.g., auto auto)"
              />
              {!isValidGridTemplate(defaultRows) && (
                <p className="text-red-500 text-sm">Invalid syntax: Please use a valid grid template format.</p>
              )}
            </div>
            {isValidGridTemplate(defaultCols) && isValidGridTemplate(defaultRows) && (
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
            )}
            </CardContent>
          </Card>
        </TabsContent>
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
                    context={{
                      name: canvasType.name,
                      description: canvasType.description
                    }}
                  />
              </TooltipProvider>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Tags</label>
                <Button 
                  onClick={fetchSuggestedTags} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {loading ? 'Suggesting...' : 'Suggest Tags'}
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

        

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Agent</span>
                <Button onClick={fetchSuggestedAIAgent} disabled={loading}>
                  {loading ? 'Loading...' : 'Fetch Suggested AI Agent'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={aiAgent?.name || ''}
                onChange={(e)=>{
                    var newAiAgent = {...aiAgent, name: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="AI Agent Name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={aiAgent?.systemPrompt || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, systemPrompt: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="System Prompt"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Question Prompt</label>
              <Textarea
                value={aiAgent?.questionPrompt || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, questionPrompt: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="Question Prompt"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Critique Prompt</label>
              <Textarea
                value={aiAgent?.critiquePrompt || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, critiquePrompt: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="Critique Prompt"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Research Prompt</label>
              <Textarea
                value={aiAgent?.researchPrompt || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, researchPrompt: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="Research Prompt"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Suggest Prompt</label>
              <Textarea
                value={aiAgent?.suggestPrompt || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, suggestPrompt: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="Suggest Prompt"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Question Tool Description</label>
              <Textarea
                value={aiAgent?.questionToolDescription || ''}
                onChange={(e) => {
                    var newAiAgent = {...aiAgent, questionToolDescription: e.target.value } as AIAgent
                    setAiAgent(newAiAgent)
                }}
                placeholder="Question Tool Description"
              />
            </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
} 