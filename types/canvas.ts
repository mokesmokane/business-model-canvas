import { CanvasLayoutDetails } from "./canvas-sections";

import { CanvasType } from "./canvas-sections";

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
  canvasLayout?: string[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  theme?: 'light' | 'dark';
  canvasTypeKey?: string;
  canvasLayoutKey?: string;
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
  canvasLayout?: string[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  canvasTypeKey?: string;
  canvasLayoutKey?: string;
}

export interface CanvasState {
  currentCanvas: Canvas | null;
  formData: Canvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
}
  