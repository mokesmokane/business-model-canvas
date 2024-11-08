export interface BusinessModelCanvas {
  id?: string;
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  keyPartners: string[];
  keyPartners_ai_suggestion_markdown?: string;
  keyActivities: string[];
  keyActivities_ai_suggestion_markdown?: string;
  valuePropositions: string[];
  valuePropositions_ai_suggestion_markdown?: string;
  customerRelationships: string[];
  customerRelationships_ai_suggestion_markdown?: string;
  channels: string[];
  channels_ai_suggestion_markdown?: string;
  customerSegments: string[];
  customerSegments_ai_suggestion_markdown?: string;
  keyResources: string[];
  keyResources_ai_suggestion_markdown?: string;
  costStructure: string[];
  costStructure_ai_suggestion_markdown?: string;
  revenueStreams: string[];
  revenueStreams_ai_suggestion_markdown?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
    keyPartners_ai_suggestion_markdown: '',
    keyActivities: [],
    keyActivities_ai_suggestion_markdown: '',
    keyResources: [],
    keyResources_ai_suggestion_markdown: '',
    valuePropositions: [],
    valuePropositions_ai_suggestion_markdown: '',
    customerRelationships: [],
    customerRelationships_ai_suggestion_markdown: '',
    channels: [],
    channels_ai_suggestion_markdown: '',
    customerSegments: [],
    customerSegments_ai_suggestion_markdown: '',
    costStructure: [],
    costStructure_ai_suggestion_markdown: '',
    revenueStreams: [],
    revenueStreams_ai_suggestion_markdown: '',
    userId: '',
    createdAt: undefined,
    updatedAt: undefined
  });
  