'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CanvasTypeService } from '@/services/canvasTypeService';
import { CanvasType, CanvasSection } from '@/types/canvas-sections';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Plus, Trash2, Pencil } from 'lucide-react';
import IconSelector from '@/app/components/IconSelector';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export default function EditCanvasTypePage() {
  const { isAdminUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null);
  const canvasTypeService = new CanvasTypeService();

  useEffect(() => {
    if (!isAdminUser) {
      router.push('/');
      return;
    }

    loadCanvasType();
  }, [isAdminUser, router]);

  const loadCanvasType = async () => {
    try {
      const typeId = params.id as string;
      const type = await canvasTypeService.getCanvasType(typeId);
      setCanvasType(type);
    } catch (err) {
      setError('Failed to load canvas type');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!canvasType) return;

    try {
      await canvasTypeService.updateCanvasType(params.id as string, canvasType);
      router.push('/admin');
    } catch (err) {
      setError('Failed to save canvas type');
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

      <div className="space-y-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sections</span>
              <Button
                onClick={() => {
                  const newSection: CanvasSection = {
                    name: 'New Section',
                    icon: 'Square',
                    placeholder: '',
                    gridIndex: canvasType.sections.length
                  };
                  setCanvasType({
                    ...canvasType,
                    sections: [...canvasType.sections, newSection]
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleSectionReorder}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {canvasType.sections.map((section, index) => (
                      <Draggable
                        key={`section-${index}`}
                        draggableId={`section-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-lg p-4 mb-4"
                          >
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps}>
                                <Grip className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex-1 space-y-4">
                                <Input
                                  value={section.name}
                                  onChange={(e) => {
                                    const updatedSections = [...canvasType.sections];
                                    updatedSections[index] = {
                                      ...section,
                                      name: e.target.value
                                    };
                                    setCanvasType({
                                      ...canvasType,
                                      sections: updatedSections
                                    });
                                  }}
                                  placeholder="Section Name"
                                />
                                <IconSelector

                                  value={section.icon}
                                  onChange={(icon) => {
                                    const updatedSections = [...canvasType.sections];
                                    updatedSections[index] = {
                                      ...section,
                                      icon
                                    };
                                    setCanvasType({
                                      ...canvasType,
                                      sections: updatedSections
                                    });
                                  }}
                                />
                                <Textarea
                                  value={section.placeholder}
                                  onChange={(e) => {
                                    const updatedSections = [...canvasType.sections];
                                    updatedSections[index] = {
                                      ...section,
                                      placeholder: e.target.value
                                    };
                                    setCanvasType({
                                      ...canvasType,
                                      sections: updatedSections
                                    });
                                  }}
                                  placeholder="Section Placeholder Text"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  const updatedSections = canvasType.sections.filter(
                                    (_, i) => i !== index
                                  );
                                  setCanvasType({
                                    ...canvasType,
                                    sections: updatedSections
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 