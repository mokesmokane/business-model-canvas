import { Canvas } from "@/types/canvas";

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