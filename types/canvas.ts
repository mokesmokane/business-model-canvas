import { CanvasMetadata } from "@/services/canvasService";
import { BUSINESS_MODEL_LAYOUT, CanvasLayout, CanvasLayoutDetails, CanvasSection } from "./canvas-sections";

import { CanvasType } from "./canvas-sections";


export interface CanvasItem {
  id: string;
  name: string;
  canvasTypeId: string;
}

export interface CanvasFolder {
  id: string;
  name: string;
  canvases: Map<string, CanvasItem>;
  parentId: string | null;
}

export interface NestedCanvasFolder extends CanvasFolder {
  children: NestedCanvasFolder[];
}

export interface AIAgent {
  name: string;
  systemPrompt: string;
  questionPrompt: string;
  critiquePrompt: string;
  researchPrompt: string;
  suggestPrompt: string;
  questionToolDescription: string;
}

export interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

export interface CanvasLink {
  canvasId: string;
  canvasTypeId: string;
}

export interface SectionItem {
  id: string;
  canvasLink: CanvasLink | null;
}

export class TextSectionItem implements SectionItem {
  id: string;
  canvasLink: CanvasLink | null;
  content: string;

  constructor(id: string, content: string) {
    this.id = id;
    this.content = content;
    this.canvasLink = null;
  }
}
export interface Section {
  name: string;
  gridIndex: number;
  sectionItems: SectionItem[];
  qAndAs: AIQuestion[];
  viewPreferences?: {
    type: 'list' | 'grid';
    columns?: number;
  };
}

export interface AIQuestion {
  id: string;
  question: string;
  section: string;
  type: 'open' | 'rating' | 'multipleChoice';
  options: string[];
  scale: {
    min: number;
    max: number;
    label: string;
  }|null;
  answer: string | number | null;
}

export interface SerializedSectionItem {
  id: string;
  content: string;
  canvasLink: string | null;
}

export interface SerializedSection {
  name: string;
  gridIndex: number;
  sectionItems: any[];
  qAndAs: AIQuestion[];
}

export interface SerializedSections {
  [key: string]: SerializedSection;
}

export interface Canvas {
  id: string;
  name: string;
  description: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: Map<string, Section>;
  canvasType: CanvasType;
  canvasLayout: CanvasLayout;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  theme?: 'light' | 'dark';
  parentCanvasId: string | null;
  showInputs?: boolean;
}

export const createNewCanvas = (id: string, name: string, description: string, canvasType: CanvasType, parentCanvasId: string | null): Canvas => {
  const sectionsMap = new Map(
    canvasType.sections.map((s: CanvasSection): [string, Section] => [
      s.name,
      {
        name: s.name,
        gridIndex: s.gridIndex,
        sectionItems: [],
        qAndAs: []
      }
    ])
  );
  return {
    id,
    name,
    description,
    designedFor: '',
    designedBy: '',
    date: new Date().toISOString(),
    version: '1.0',
    canvasType,
    createdAt: new Date(),
    updatedAt: new Date(),
    parentCanvasId: parentCanvasId || null,
    canvasLayout: canvasType.defaultLayout ? canvasType.defaultLayout.layout : BUSINESS_MODEL_LAYOUT.layout,
    sections: sectionsMap,
  }
}

export interface SerializedCanvas {
  id: string;
  name: string;
  description: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: SerializedSections;
  canvasLayout: CanvasLayout;
  canvasType: CanvasType;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  parentCanvasId: string | null;
}

export interface CanvasState {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
}

export interface CanvasHierarchyNode {
  id: string;
  title: string;
  type: string;
  parentId?: string;
  children?: CanvasHierarchyNode[];
}

export function buildCanvasHierarchy(
  startCanvas: CanvasMetadata,
  allCanvases: Map<string, CanvasMetadata>
): CanvasHierarchyNode[] {
  // First, crawl up to find the root canvas(es)
  const findRootCanvas = (canvas: CanvasMetadata): CanvasMetadata => {
    if (!canvas.parentCanvasId || !allCanvases.has(canvas.parentCanvasId)) {
      return canvas;
    }
    const parentCanvas = allCanvases.get(canvas.parentCanvasId);
    return parentCanvas ? findRootCanvas(parentCanvas) : canvas;
  };

  const rootCanvas = findRootCanvas(startCanvas);
  const processedIds = new Set<string>();

  // Helper function to build node hierarchy
  const buildNode = (canvas: CanvasMetadata): CanvasHierarchyNode => {
    if (processedIds.has(canvas.id)) {
      return {
        id: canvas.id,
        title: canvas.name,
        type: canvas.canvasType.name,
      };
    }
    
    processedIds.add(canvas.id);
    
    // Get child canvases from section item links
    const childCanvases: CanvasMetadata[] = [];
    canvas.sections.forEach(section => {
      section.sectionItems.forEach(item => {
        if (item.canvasLink && allCanvases.has(item.canvasLink.canvasId)) {
          const linkedCanvas = allCanvases.get(item.canvasLink.canvasId);
          if (linkedCanvas) {
            childCanvases.push(linkedCanvas);
          }
        }
      });
    });
    
    const node: CanvasHierarchyNode = {
      id: canvas.id,
      title: canvas.name,
      type: canvas.canvasType.name,
    };
    
    if (canvas.parentCanvasId) {
      node.parentId = canvas.parentCanvasId;
    }
    
    if (childCanvases.length > 0) {
      node.children = childCanvases.map(child => buildNode(child));
    }
    
    return node;
  };

  // If the root canvas is the same as our start canvas, just return a single node
  if (rootCanvas.id === startCanvas.id) {
    return [buildNode(rootCanvas)];
  }

  // Otherwise, we need to build the full hierarchy from the root down to include our canvas
  const hierarchy = [buildNode(rootCanvas)];
  return hierarchy;
}
  