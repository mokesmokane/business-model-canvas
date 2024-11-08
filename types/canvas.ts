export interface BusinessModelCanvas {
  id?: string;
  companyName: string;
  companyDescription: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  keyPartners: string;
  keyActivities: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  keyResources: string;
  costStructure: string;
  revenueStreams: string;
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
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: '',
    userId: '',
    createdAt: undefined,
    updatedAt: undefined
  });
  