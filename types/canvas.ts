import { CanvasLayout, CanvasLayoutDetails } from "./canvas-sections";

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
  id?: string;
  name: string;
  description: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: Map<string, Section>;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  theme?: 'light' | 'dark';
  canvasType: CanvasType;
  canvasLayout: CanvasLayout;
}

export interface SerializedCanvas {
  id?: string;
  name: string;
  description: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: SerializedSections;
  canvasLayout: CanvasLayout;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  canvasType: CanvasType;
}

export interface CanvasState {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
}
  