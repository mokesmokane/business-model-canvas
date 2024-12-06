import { Canvas } from "@/types/canvas";
import { CanvasType } from "@/types/canvas-sections";

export interface DiveInRequest {
    parentCanvas: Canvas
    section: {
      id: string;
      name: string;
      placeholder: string;
    };
    item: {
      id: string;
      content: string;
    };
  }
  
export interface DocumentDiveInRequest {
  documentText: string;
}

export interface SuggestionRequest {
  documentText: string;
  canvasType: CanvasType;
  sections: string[];
}


export interface ExistingCanvasTypeSuggestion {
  canvasTypeId: string;
    rationale: string;
    initialContent: {
      name: string;
      description: string;
    };
  }
  
  export interface ExistingCanvasDiveResponse {
    suggestions: ExistingCanvasTypeSuggestion[];
  }
  
  export interface NewCanvasTypeSuggestion {
    name: string;
    icon: string;
    description: string;
    sections: { name: string; placeholder: string }[];
    rationale: string;
  }
  
  
  export interface NewCanvasDiveResponse {
    suggestions: NewCanvasTypeSuggestion[];
  }