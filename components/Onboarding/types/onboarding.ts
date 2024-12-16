export type Interest = 'business' | 'creativity' | 'education' | 'other'

export interface OnboardingState {
  interest: Interest | null
  completed: boolean
  selectedCanvas?: string
}

export interface CanvasRecommendation {
  id: string
  title: string
  description: string
  category: Interest
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  canvasTypeId: string
}

