'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CanvasType, CanvasLayoutDetails } from '@/types/canvas-sections';
import { CanvasTypeService } from '@/services/canvasTypeService';
import { Trash2, Pencil, Bot, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DynamicIcon from '@/components/Util/DynamicIcon';
import { DeleteCanvasDialog } from '@/components/DeleteCanvasDialog';
import { AIAgentService } from '@/services/aiAgentService';
import { AIAgent } from '@/types/canvas';

export default function AdminPage() {
  const { user, isAdminUser } = useAuth();
  const router = useRouter();
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({});
  const [layouts, setLayouts] = useState<Record<string, CanvasLayoutDetails>>({});
  const [error, setError] = useState<string | null>(null);
  const canvasTypeService = new CanvasTypeService();
  const [activeTab, setActiveTab] = useState<'types' | 'layouts'>('types');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'type' | 'layout' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');
  const [aiAgents, setAiAgents] = useState<Record<string,AIAgent>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const aiAgentService = new AIAgentService();

  useEffect(() => {
    if (!isAdminUser) {
      router.push('/');
      return;
    }
    
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const types = await canvasTypeService.getCanvasTypes();
      const layoutsData = await canvasTypeService.getCanvasLayouts();
      const aiAgentsData = await aiAgentService.getAiAgents();
      setCanvasTypes(types);
      setLayouts(layoutsData);
      setAiAgents(aiAgentsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  const openDialog = (type: 'type' | 'layout', id: string, name: string) => {
    setDialogType(type);
    setSelectedId(id);
    setSelectedName(name);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setDialogType(null);
    setSelectedId(null);
    setSelectedName('');
  };

  const confirmDelete = async () => {
    if (dialogType === 'type' && selectedId) {
      await handleDeleteType(selectedId);
    } else if (dialogType === 'layout' && selectedId) {
      await handleDeleteLayout(selectedId);
    }
    closeDialog();
  };

  const handleDeleteType = async (typeId: string) => {
    try {
      await canvasTypeService.deleteCanvasType(typeId);
      await loadData();
    } catch (err) {
      setError('Failed to delete canvas type');
      console.error(err);
    }
  };

  const handleDeleteLayout = async (layoutId: string) => {
    try {
      await canvasTypeService.deleteCanvasLayout(layoutId);
      await loadData();
    } catch (err) {
      setError('Failed to delete layout');
      console.error(err);
    }
  };

  const handleGenerateAIAgent = async (typeId: string) => {
    setLoading(new Set([...loading, typeId]));
    try {
      const response = await fetch('/api/ai-agent-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ canvasType: typeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI agent');
      }

      const { aiAgent } = await response.json();

      if (aiAgent) {
        await aiAgentService.updateAIAgent(typeId, aiAgent);
        await loadData(); // Refresh data after creating AI agent
      } else {
        throw new Error('AI agent creation failed');
      }
    } catch (err) {
      setError('Failed to generate AI agent');
      console.error(err);
    } finally {
      setLoading(new Set([...loading].filter(id => id !== typeId)));
    }
  };

  // Helper function to sort entries by name
  const sortCanvasTypeByName = (entries: [string, CanvasType][]) => {
    return entries.sort((a, b) => a[1].name.localeCompare(b[1].name));
  };

  const sortCanvasLayoutByName = (entries: [string, CanvasLayoutDetails][]) => {
    return entries.sort((a, b) => a[1].name.localeCompare(b[1].name));
  };

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <div className="flex space-x-4 mb-4">
          <Button
            variant={activeTab === 'types' ? 'outline' : 'primary'}
            onClick={() => setActiveTab('types')}
          >
            Canvas Types
          </Button>
          <Button
            variant={activeTab === 'layouts' ? 'outline' : 'primary'}
            onClick={() => setActiveTab('layouts')}
          >
            Canvas Layouts
          </Button>
        </div>

        {activeTab === 'types' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Canvas Types</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead style={{ width: '300px' }}>Default Layout</TableHead>
                  <TableHead>AI Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortCanvasTypeByName(Object.entries(canvasTypes)).map(([id, type]) => (
                  <TableRow key={id} className="h-40">
                    <TableCell>
                      <DynamicIcon 
                        name={type.icon || 'image'} 
                        className="w-8 h-8" 
                        size={24}
                      />
                    </TableCell>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>{type.sections.length}</TableCell>
                    <TableCell style={{ width: '300px' }}>
                      <div 
                        className="grid gap-1 p-2 border rounded-md h-32"
                        style={{
                          gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns,
                          gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows,
                        }}
                      >
                        {type.defaultLayout?.layout.areas.map((area, index) => {
                          const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-center border-2 border-dashed h-full"
                              style={{
                                gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                              }}
                            >
                              {/* Optionally, you can add an icon or text here */}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {aiAgents[id] ? (
                        <Bot className="h-4 w-4 text-green-500" />
                      ) : loading.has(id) ?<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      :(
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleGenerateAIAgent(id)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/canvas-types/${id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDialog('type', id, type.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        {activeTab === 'layouts' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Canvas Layouts</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Section Count</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortCanvasLayoutByName(Object.entries(layouts)).map(([id, layout]) => (
                  <TableRow key={id} className="h-40">
                    <TableCell>{layout.name}</TableCell>
                    <TableCell>{layout.sectionCount}</TableCell>
                    <TableCell>
                      <div 
                        className="grid gap-1 p-2 border rounded-md h-32"
                        style={{
                          gridTemplateColumns: layout.layout.gridTemplate.columns,
                          gridTemplateRows: layout.layout.gridTemplate.rows,
                        }}
                      >
                        {layout.layout.areas.map((area, index) => {
                          const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-center border-2 border-dashed h-full"
                              style={{
                                gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                              }}
                            >
                              {/* Optionally, you can add an icon or text here */}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/layouts/${id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDialog('layout', id, layout.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}
      </div>

      <DeleteCanvasDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={confirmDelete}
        canvasName={selectedName}
      />

    </div>
  );
} 