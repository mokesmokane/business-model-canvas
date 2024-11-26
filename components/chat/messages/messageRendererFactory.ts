
import { DefaultMessageRenderer } from './DefaultMessageRenderer'
import { CreateCanvasMessageRenderer } from './CreateCanvasMessageRenderer'

export const getMessageRenderer = (interaction: string | null, onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void, onSuggestionDismiss: (messageIndex: number, id: string) => void, onSuggestionExpand: (suggestion: { suggestion: string }) => void, onQuestionSubmit: (question: any) => void) => {
  console.log('interaction', interaction)
  switch (interaction) {
    case 'createCanvas':
      console.log('createCanvas renderer')
      return CreateCanvasMessageRenderer({onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit})
    default:
      return DefaultMessageRenderer({onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit})
  }
}