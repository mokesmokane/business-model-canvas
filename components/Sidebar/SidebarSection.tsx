import { ChevronLeft, LucideIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import React from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { NewCanvasDialog } from '@/components/NewCanvasDialog';
import { useExpanded } from '@/contexts/ExpandedContext';

interface SectionItem {
  id: string;
  name: string;
}

interface SidebarSectionProps {
  icon: LucideIcon;
  title: string;
  items: SectionItem[];
  isExpanded: boolean;
  onItemClick?: (id: string) => void;
  onNewItem?: () => void;
}

export function SidebarSection({ 
  icon: Icon, 
  title, 
  items, 
  isExpanded
}: SidebarSectionProps) {
  const { loadCanvas, createNewCanvas, deleteCanvas, resetForm, currentCanvas } = useCanvas();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { setIsExpanded, setIsWide } = useExpanded()

  const handleCanvasSelect = React.useCallback(async (canvasId: string) => {
    await loadCanvas(canvasId);
    localStorage.setItem('lastCanvasId', canvasId);
  }, [loadCanvas]);
  
  const handleNewCanvas = React.useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleDeleteCanvas = React.useCallback(async (canvasId: string) => {
    await deleteCanvas(canvasId);
    if (localStorage.getItem('lastCanvasId') === canvasId) {
      localStorage.removeItem('lastCanvasId');
      if (items.length > 0) {
        handleCanvasSelect(items[0].id);
      } else {
        resetForm();
        handleNewCanvas();
      }
    }
  }, [deleteCanvas, createNewCanvas, handleCanvasSelect, items]);

  return (
    <div className={isExpanded ? "space-y-2 w-full" : "flex flex-col items-center"}>
      {isExpanded ? (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center px-4 py-2">
            <Icon className="h-4 w-4 mr-2" />
            {title}
            <div className="flex-grow"></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={()=>setIsExpanded(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </h3>
          <NewCanvasDialog/>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-1 px-4">
              <Button
                variant="ghost"
                className={`flex-1 justify-start text-muted-foreground hover:text-foreground ${
                  currentCanvas?.id === item.id 
                    ? 'bg-muted font-medium border-l-2 border-primary pl-3' 
                    : 'pl-4'
                }`}
                onClick={() => handleCanvasSelect(item.id)}
              >
                {item.name}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Canvas</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCanvas(item.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground"
              onClick={()=>{setIsExpanded(true); setIsWide(false)}}
            >
              <Icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {title}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}