export interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

export interface BusinessModelCanvas {
  id?: string;
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  keyResources: string[];
  costStructure: string[];
  revenueStreams: string[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  keyPartners_ai_suggestions?: AISuggestion[];
  keyActivities_ai_suggestions?: AISuggestion[];
  valuePropositions_ai_suggestions?: AISuggestion[];
  customerRelationships_ai_suggestions?: AISuggestion[];
  channels_ai_suggestions?: AISuggestion[];
  customerSegments_ai_suggestions?: AISuggestion[];
  keyResources_ai_suggestions?: AISuggestion[];
  costStructure_ai_suggestions?: AISuggestion[];
  revenueStreams_ai_suggestions?: AISuggestion[];
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
    keyPartners: [],
    keyPartners_ai_suggestions: [],
    keyActivities: [],
    keyActivities_ai_suggestions: [],
    keyResources: [],
    keyResources_ai_suggestions: [],
    valuePropositions: [],
    valuePropositions_ai_suggestions: [],
    customerRelationships: [],
    customerRelationships_ai_suggestions: [],
    channels: [],
    channels_ai_suggestions: [],
    customerSegments: [],
    customerSegments_ai_suggestions: [],
    costStructure: [],
    costStructure_ai_suggestions: [],
    revenueStreams: [],
    revenueStreams_ai_suggestions: [],
    userId: '',
    createdAt: undefined,
    updatedAt: undefined
  });
  