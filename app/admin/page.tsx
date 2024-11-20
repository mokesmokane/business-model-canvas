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
import { Trash2, Pencil } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DynamicIcon from '@/components/Util/DynamicIcon';

export default function AdminPage() {
  const { user, isAdminUser } = useAuth();
  const router = useRouter();
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({});
  const [layouts, setLayouts] = useState<Record<string, CanvasLayoutDetails>>({});
  const [error, setError] = useState<string | null>(null);
  const canvasTypeService = new CanvasTypeService();

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
      setCanvasTypes(types);
      setLayouts(layoutsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
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
        <section>
          <h2 className="text-2xl font-semibold mb-4">Canvas Types</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortCanvasTypeByName(Object.entries(canvasTypes)).map(([id, type]) => (
                <TableRow key={id}>
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
                        onClick={() => handleDeleteType(id)}
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

        <section>
          <h2 className="text-2xl font-semibold mb-4">Canvas Layouts</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Section Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortCanvasLayoutByName(Object.entries(layouts)).map(([id, layout]) => (
                <TableRow key={id}>
                  <TableCell>{layout.name}</TableCell>
                  <TableCell>{layout.sectionCount}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteLayout(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
} 