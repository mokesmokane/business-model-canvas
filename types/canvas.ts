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
  parentSection?: string;
  parentSectionItem?: string;
  children?: CanvasHierarchyNode[];
}

export function buildCanvasHierarchy(
  startCanvas: CanvasMetadata,
  allCanvases: Map<string, CanvasMetadata>
): CanvasHierarchyNode {
  const nodes = new Map<string, CanvasHierarchyNode>();

  // 1. Find the root canvas of the hierarchy
  function findRootCanvas(canvas: CanvasMetadata): CanvasMetadata {
    let current = canvas;
    while (current.parentCanvasId && allCanvases.has(current.parentCanvasId)) {
      const parent = allCanvases.get(current.parentCanvasId)!;
      current = parent; // move up one level
    }
    return current;
  }

  const rootCanvas = findRootCanvas(startCanvas);

  // 2. Recursive function to build the hierarchy from a given canvas downwards
  function buildHierarchy(canvasId: string, parentSection?: string, parentSectionItem?: string): CanvasHierarchyNode {
    // If the node is already created, return it to avoid duplication
    if (nodes.has(canvasId)) {
      return nodes.get(canvasId)!;
    }

    // Get the current canvas metadata
    const canvas = allCanvases.get(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with ID ${canvasId} not found in the lookup.`);
    }

    // Create a new node for this canvas
    const node: CanvasHierarchyNode = {
      id: canvas.id,
      title: canvas.name,
      type: canvas.canvasType.name,
      parentId: canvas.parentCanvasId || undefined,
      parentSection: parentSection,
      parentSectionItem: parentSectionItem,
      children: []
    };

    // Store it in the map
    nodes.set(canvasId, node);

    // Recursively build and link children from the canvas's sections
    Array.from(canvas.sections.values()).forEach(section => {
      if (!section.sectionItems) return;
      
      section.sectionItems.forEach(item => {
        if (item.canvasLink && allCanvases.has(item.canvasLink.canvasId)) {
          const childNode = buildHierarchy(item.canvasLink.canvasId, section.name, item.id);
          // Add the child if not already present
          if (!node.children!.some(c => c.id === childNode.id)) {
            node.children!.push(childNode);
          }
        }
      });
    });

    return node;
  }

  // 3. Build the entire hierarchy starting from the root
  const hierarchy = buildHierarchy(rootCanvas.id);

  return hierarchy;
}
