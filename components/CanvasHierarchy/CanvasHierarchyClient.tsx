'use client'

import { useEffect, useState } from 'react';
import { CanvasHierarchy } from './CanvsHierarchy';
import { useCanvasService } from '@/contexts/CanvasServiceContext';
import { buildCanvasHierarchy } from '@/types/canvas';
import { CanvasMetadata } from '@/services/canvasService';
import { useAuth } from '@/contexts/AuthContext';
import { CanvasHierarchyNode } from '@/types/canvas';

interface CanvasHierarchyClientProps {
  canvasId: string;
}

export function CanvasHierarchyClient({ canvasId }: CanvasHierarchyClientProps) {
  const { user, loading: authLoading } = useAuth();
  const canvasService = useCanvasService();
  const [error, setError] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<CanvasHierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHierarchy() {
      if (!user) {
        setError('Please sign in to view the canvas hierarchy');
        setLoading(false);
        return;
      }

      await canvasService.initialize(user.uid);

      try {
        const allCanvases = await canvasService.getAllCanvasesMetadata();
        const startCanvas = allCanvases.get(canvasId);

        if (!startCanvas) {
          setError('Canvas not found');
          return;
        }

        const hierarchyData = buildCanvasHierarchy(startCanvas, allCanvases);
        setHierarchy([hierarchyData]);
      } catch (error) {
        console.error('Error loading canvas hierarchy:', error);
        setError('Error loading canvas hierarchy');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadHierarchy();
    }
  }, [canvasId, canvasService, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="text-muted-foreground">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="text-muted-foreground">Please sign in to view the canvas hierarchy</div>
    );
  }

  if (error) {
    return (
      <div className="text-muted-foreground">{error}</div>
    );
  }

  return <CanvasHierarchy canvases={hierarchy} />;
} 