export interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

export interface Section {
  name: string;
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

export interface BusinessModelCanvas {
  id?: string;
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: Map<string, Section>;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  theme?: 'light' | 'dark';
}

export interface SerializedBusinessModelCanvas {
  id?: string;
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  sections: SerializedSections;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CanvasState {
  currentCanvas: BusinessModelCanvas | null;
  formData: BusinessModelCanvas;
  status: 'idle' | 'loading' | 'saving' | 'error';
  error: string | null;
  isDirty: boolean;
} 
const getInitialCanvasState = (): BusinessModelCanvas => ({
    id: '',
    companyName: '',
    companyDescription: '',
    designedFor: '',
    designedBy: '',
    date: '',
    version: '',
    sections: new Map([
      ['keyPartners', { name: 'Key Partners', items: [], qAndAs: [] } as Section],
      ['keyActivities', { name: 'Key Activities', items: [], qAndAs: [] } as Section],
      ['keyResources', { name: 'Key Resources', items: [], qAndAs: [] } as Section],
      ['valuePropositions', { name: 'Value Propositions', items: [], qAndAs: [] } as Section],
      ['customerRelationships', { name: 'Customer Relationships', items: [], qAndAs: [] } as Section],
      ['channels', { name: 'Channels', items: [], qAndAs: [] } as Section],
      ['customerSegments', { name: 'Customer Segments', items: [], qAndAs: [] } as Section],
      ['costStructure', { name: 'Cost Structure', items: [], qAndAs: [] } as Section],
      ['revenueStreams', { name: 'Revenue Streams', items: [], qAndAs: [] } as Section],
    ]),
    userId: '',
    createdAt: undefined,
    updatedAt: undefined,
    theme: 'light'
  });
  