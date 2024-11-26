import { Message } from '@/contexts/ChatContext'

export interface MessageRendererProps {
  onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void
  onSuggestionDismiss: (messageIndex: number, id: string) => void
  onSuggestionExpand: (suggestion: { suggestion: string }) => void
  onQuestionSubmit: (question: any) => void
}

export interface MessageRenderer {
  render: (props: MessageRendererProps) => React.ReactNode
}
