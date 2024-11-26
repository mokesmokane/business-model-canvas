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

export interface Section {
  name: string;
  gridIndex?: number;
  items: string[];
  qAndAs: AIQuestion[];
}

export interface AIQuestion {
  id: string;
  question: string;
  section: string;
  type: 'open' | 'rating' | 'multipleChoice';
  options?: string[];
  scale?: {
    min: number;
    max: number;
    label: string;
  };
  answer?: string | number;
}

export interface SerializedSections {
  [key: string]: Section;
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
}

export const createNewCanvas = (id: string, name: string, description: string, canvasType: CanvasType): Canvas => {
  const sectionsMap = new Map(
    canvasType.sections.map((s: CanvasSection): [string, Section] => [
      s.name,
      {
        name: s.name,
        gridIndex: s.gridIndex,
        items: [],
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
}

export interface CanvasState {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
}
  