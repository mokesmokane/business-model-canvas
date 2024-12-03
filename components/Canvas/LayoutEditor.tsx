'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Undo2, Save, Grid2x2 } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';
import { CanvasLayout, CanvasSection, compareLayouts } from '@/types/canvas-sections';
import { motion } from 'framer-motion';
import { CanvasTypeService } from '@/services/canvasTypeService';
import { CanvasLayoutDetails } from '@/types/canvas-sections';
import { useLayouts } from '@/contexts/LayoutContext';
import DynamicIcon from '../Util/DynamicIcon';
import { Responsive, WidthProvider } from 'react-grid-layout'
import { cssToGridItems, gridItemsToCss } from '../LayoutGrid/utils';
import { GridItem as LayoutGridItem } from '../LayoutGrid/gridTypes'
const ResponsiveGridLayout = WidthProvider(Responsive)

interface LayoutItem {
  id: string;
  content: string;
  icon: string;
  gridArea: string;
  sectionKey: string;
  gridIndex: number;
}

interface GridItemProps {
  item: LayoutItem;
  canvasTheme?: string;
  isHighlighted: boolean;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const fixedCols = 12;
const rowHeight = 50;
function GridItem({ 
  item, 
  canvasTheme,
  isHighlighted,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: GridItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragEnter={() => onDragEnter(item.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      style={{ gridArea: item.gridArea }}
      className={`
        p-4 rounded-lg border flex flex-col
        transition-colors duration-200 cursor-grab active:cursor-grabbing
        ${isHighlighted ? 'ring-2 ring-primary bg-primary/10' : ''}
        ${canvasTheme === 'dark' 
          ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' 
          : 'bg-white border-gray-200 hover:bg-gray-50'}
      `}
    >
      <div className="flex items-center gap-2">
        <DynamicIcon name={item.icon} className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{item.content}</span>
      </div>
    </div>
  );
}

interface LayoutEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LayoutEditor({ open, onOpenChange }: LayoutEditorProps) {
  const { formData, canvasTheme, updateLayout } = useCanvas();
  if (!formData) return null;
  const currentLayout = formData.canvasLayout;
  const canvasType = formData.canvasType;
  
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(() => {
    const sortedSections = Array.from(formData?.sections.entries() || [])
      .map(([key, section], index) => ({
        key,
        section,
        gridIndex: section.gridIndex ?? index
      }))
      .sort((a, b) => a.gridIndex - b.gridIndex);
      
    return sortedSections.map((item, index) => {
      const sectionConfig = canvasType.sections.find(s => s.name === item.section.name);
      return {
        id: `section-${index}`,
        content: sectionConfig?.name || '',
        icon: sectionConfig?.icon || 'QuestionMark',
        gridArea: currentLayout.areas?.[index] || 'auto',
        sectionKey: item.key,
        gridIndex: item.gridIndex
      };
    });
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<CanvasLayout>(formData.canvasLayout);
  const [availableLayouts, setAvailableLayouts] = useState<CanvasLayoutDetails[]>([]);
  const { getLayoutsForSectionCount, isLoading } = useLayouts();
  const [customLayout, setCustomLayout] = useState<boolean>(false);
  const [defaultAreas, setDefaultAreas] = useState<string[]>([]);
  const [defaultCols, setDefaultCols] = useState<string>('');
  const [defaultRows, setDefaultRows] = useState<string>('');
  
  const [gridItems, setGridItems] = useState<LayoutGridItem[]>([])

  useEffect(() => {
    try {
      setDefaultAreas(currentLayout.areas || []);
      setDefaultCols(currentLayout.gridTemplate.columns || '');
      setDefaultRows(currentLayout.gridTemplate.rows || '');
    } catch (err) {
      console.error(err);
    }
  }, [canvasType])

  useEffect(() => {
    if (defaultRows.includes('repeat')) {
      console.error('Invalid row definition: "repeat" syntax is not supported.')
      return
    }

    const initialItems = cssToGridItems(defaultAreas, defaultCols, defaultRows)
    setGridItems(initialItems)
  }, [defaultAreas, defaultCols, defaultRows])
  
  useEffect(() => {
    const loadLayouts = async () => {
      const layouts = await getLayoutsForSectionCount(canvasType.sections.length);
      setAvailableLayouts(layouts);
    };

    loadLayouts();
  }, [canvasType.sections.length, getLayoutsForSectionCount]);

  const [gridStyle, setGridStyle] = useState({});

  useEffect(() => {
    setGridStyle({
      gridTemplateColumns: currentLayout.gridTemplate.columns,
      gridTemplateRows: currentLayout.gridTemplate.rows,
    });
  }, [currentLayout]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnter = (id: string) => {
    if (id !== draggedId) {
      setTargetId(id);
    }
  };

  const handleDragEnd = () => {
    if (draggedId && targetId) {
      setLayoutItems((items) => {
        const draggedIndex = items.findIndex(item => item.id === draggedId);
        const targetIndex = items.findIndex(item => item.id === targetId);
        
        const newItems = [...items];
        const draggedGridArea = items[draggedIndex].gridArea;
        const targetGridArea = items[targetIndex].gridArea;
        const draggedGridIndex = items[draggedIndex].gridIndex;
        const targetGridIndex = items[targetIndex].gridIndex;
        
        // Swap grid areas and keep original gridIndex values
        newItems[draggedIndex] = {
          ...items[draggedIndex],
          gridArea: targetGridArea,
          gridIndex: targetGridIndex
        };
        newItems[targetIndex] = {
          ...items[targetIndex],
          gridArea: draggedGridArea,
          gridIndex: draggedGridIndex
        };
        
        return newItems;
      });
    }
    
    setDraggedId(null);
    setTargetId(null);
  };
  const onLayoutChange = (layout: LayoutGridItem[]) => {
    const newItems = layout.map(item => ({
      ...item,
      w: Math.max(item.w, 1),
      h: Math.max(item.h, 1),
    }))
    setGridItems(newItems)
    
    const { areas, cols, rows } = gridItemsToCss(newItems)
    
    setDefaultAreas(areas)
    setDefaultCols(cols)
    setDefaultRows(rows)
  }
  const handleLayoutSelect = (layout: CanvasLayout) => {
    setCustomLayout(false);
    setSelectedLayout(layout);
    const newLayout = layout;
    
    // Maintain existing section order when changing layouts
    setLayoutItems(layoutItems.map((item, index) => ({
      ...item,
      gridArea: newLayout.areas?.[index] || 'auto'
    })));

    setGridStyle({
      gridTemplateColumns: newLayout.gridTemplate.columns,
      gridTemplateRows: newLayout.gridTemplate.rows,
    });
  };

  const handleSave = () => {
    const orderedSectionKeys = layoutItems
      .sort((a, b) => a.gridIndex - b.gridIndex)
      .map(item => item.sectionKey);

    if (customLayout) {
      const newLayout = {
        areas: defaultAreas,
        gridTemplate: {
          columns: defaultCols,
          rows: defaultRows
        }
      }
      updateLayout(orderedSectionKeys, newLayout);
    } else {
      // Create ordered array of section keys based on gridIndex
      
      // Update layout with new section order
      updateLayout(orderedSectionKeys, selectedLayout);
    }
    

    onOpenChange(false);
  };

  const handleReset = () => {
    // Reset to original order based on canvasType sections
    setLayoutItems(canvasType.sections.map((section, index) => ({
      id: `section-${index}`,
      content: section.name,
      icon: section.icon,
      gridArea: currentLayout.areas?.[index] || 'auto',
      sectionKey: section.name,
      gridIndex: index
    })));

    setGridStyle({
      gridTemplateColumns: currentLayout.gridTemplate.columns,
      gridTemplateRows: currentLayout.gridTemplate.rows,
    });
  };

  // Add this useEffect to handle open state changes
  useEffect(() => {
    if (open) {
      setCustomLayout(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[1200px] w-full h-[90vh] flex flex-col ${
          canvasTheme === 'dark' ? 'bg-gray-950 text-gray-50' : 'bg-white text-gray-900'
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid2x2 className="h-6 w-6" />
            Edit Canvas Layout
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-grow overflow-hidden">
          {/* Grid Container */}
          <div
            className={`p-4 rounded-lg border flex-grow overflow-auto ${
              canvasTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}
          > {
            customLayout ? (
              <ResponsiveGridLayout
                className="layout bg-gray-50 border rounded-lg"
                layouts={{ lg: gridItems }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: fixedCols, md: fixedCols, sm: fixedCols, xs: fixedCols, xxs: fixedCols }}
                rowHeight={rowHeight}
                width={1200}
                onLayoutChange={onLayoutChange}
                compactType={null}
                preventCollision={true}
                isResizable={true}
                isDraggable={true}
              >
                {gridItems.map((item, index) => {
                  const section = canvasType?.sections[index];
                  return (
                    <div
                      key={item.i}
                      className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg p-4 flex flex-col gap-2 shadow-md cursor-move border-2 border-dashed border-primary/20"
                    >
                      {section ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DynamicIcon name={section.icon} className="h-4 w-4 text-primary" />
                              <div className="font-medium text-primary">{section.name}</div>
                            </div>
                          </div>
                          {section.placeholder && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {section.placeholder}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-muted-foreground">Area {parseInt(item.i) + 1}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.w}x{item.h}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            ) : (
              <div 
                className="grid gap-2 h-full w-full"
                style={{
                  ...gridStyle,
                  minHeight: '100%',
                  minWidth: '100%'
              }}
            >
              {layoutItems.map((item) => (
                <GridItem 
                  key={item.id} 
                  item={item}
                  canvasTheme={canvasTheme}
                  isHighlighted={item.id === targetId}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                />
              ))}
              </div>
            )
          }
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 mt-auto">
            {/* Scrolling Buttons Container */}
            <div className="overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {isLoading ? (
                  <div className="flex items-center justify-center w-full p-4">
                    <span className="text-muted-foreground">Loading layouts...</span>
                  </div>
                ) : (
                  availableLayouts.map((layoutDetails) => (
                    <motion.div
                      key={layoutDetails.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 transition-all duration-300 flex-shrink-0"
                    >
                      <Button
                        variant="outline"
                        className={`w-24 h-24 p-2 ${
                          compareLayouts(layoutDetails.layout, selectedLayout) 
                            ? 'bg-primary text-primary-foreground' 
                            : canvasTheme === 'dark'
                              ? 'bg-gray-800 text-gray-200'
                              : 'bg-gray-100 text-gray-800'
                        } hover:bg-primary/90 hover:text-primary-foreground transition-colors duration-200`}
                        onClick={() => handleLayoutSelect(layoutDetails.layout)}
                      >
                        <div
                          className="w-full h-full grid gap-1"
                          style={{
                            gridTemplateColumns: layoutDetails.layout.gridTemplate.columns,
                            gridTemplateRows: layoutDetails.layout.gridTemplate.rows,
                          }}
                        >
                          {Array.from({ length: layoutDetails.sectionCount }).map((_, index) => (
                            <div
                              key={index}
                              className={`rounded-sm transition-colors duration-200 ${
                                compareLayouts(layoutDetails.layout, selectedLayout) 
                                  ? 'bg-primary-foreground' 
                                  : canvasTheme === 'dark'
                                    ? 'bg-gray-700'
                                    : 'bg-gray-300'
                              }`}
                              style={{
                                gridArea: layoutDetails.layout.areas?.[index] || 'auto',
                              }}
                            />
                          ))}
                        </div>
                      </Button>
                    </motion.div>
                  ))
                  
                )}
                <motion.div
                      key={'custom'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 transition-all duration-300 flex-shrink-0"
                    >
                      <Button
                        variant="outline"
                        className={`w-24 h-24 p-2 ${canvasTheme === 'dark'
                              ? 'bg-gray-800 text-gray-200'
                              : 'bg-gray-100 text-gray-800'
                        } hover:bg-primary/90 hover:text-primary-foreground transition-colors duration-200`}
                        onClick={() => setCustomLayout(true)}
                      >
                        <svg 
                      className="w-8 h-8 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" 
                      />
                    </svg>
                      </Button>
                </motion.div>
              </div>
              <div className="flex items-center justify-end gap-2 pb-1">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
                canvasTheme={canvasTheme}
              >
                <Undo2 className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
                canvasTheme={canvasTheme}
              >
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
            </div>
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}