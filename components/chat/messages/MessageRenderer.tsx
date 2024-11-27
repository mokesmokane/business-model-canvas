import { Message, CanvasTypeSuggestionMessage, SuggestionMessage, QuestionMessage, AdminMessage, useChat, TrailPeroidEndedMessage } from "@/contexts/ChatContext"
import { Bot, User, AlertTriangle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { motion, AnimatePresence } from "framer-motion"
import AISuggestionItem from "../AISuggestionItem"
import AIQuestionItem from "../AIQuestionItem"
import CanvasSuggestionItem from "./CanvasSuggestionItem"
import NewCanvasSuggestionItem from "./NewCanvasSuggestionItem"
import { Section } from "@/types/canvas"
import { useCanvas } from "@/contexts/CanvasContext"
import { Button } from "@/components/ui/button"

interface MessageRendererProps {
  message: Message
  messageIndex: number
}

export function MessageRenderer({ message, messageIndex}: MessageRendererProps) {
  // Render the base message content
  const renderBaseMessage = () => {
    if (message.role === 'error') {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span>{message.content}</span>
        </div>
      )
    }
    return (
      <ReactMarkdown className="prose dark:prose-invert prose-sm">
        {message.content}
      </ReactMarkdown>
    )
  }

  // Render additional content based on message type
  const renderAdditionalContent = () => {
    if (message instanceof CanvasTypeSuggestionMessage) {
      return <CanvasTypeSuggestionMessageDetails message={message} />
    }

    if (message instanceof SuggestionMessage && message.suggestions || (message as SuggestionMessage).suggestions) {
      return <SuggestionMessageDetails message={(message as SuggestionMessage)} messageIndex={messageIndex} />
    }

    if ((message instanceof QuestionMessage && message.questions) || (message as QuestionMessage).questions) {
      return <QuestionMessageDetails message={(message as QuestionMessage)} />
    }

    if (message instanceof TrailPeroidEndedMessage) {
      return <TrailPeroidEndedMessageDetails message={message} />
    }

    return null
  }

  return (
    console.log('message', message),
    <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </div>
      )}
      <div className={`max-w-[600px] rounded-lg p-3 ${
        message.role === 'user' 
          ? 'bg-muted text-muted-foreground dark:bg-secondary dark:text-secondary-foreground' 
          : message.role === 'assistant'
          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
          : 'bg-destructive/50 text-destructive-foreground'
      }`}>
        {renderBaseMessage()}
        {renderAdditionalContent()}
      </div>
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary flex items-center justify-center">
          <User className="w-5 h-5 text-secondary-foreground dark:text-secondary-foreground" />
        </div>
      )}
    </div>
  )
} 

export function CanvasTypeSuggestionMessageDetails({ message }: { message: CanvasTypeSuggestionMessage }) {
    const existing = message.canvasTypeSuggestions.map((suggestion) => (
        <div key={suggestion}>
          <CanvasSuggestionItem canvasTypeId={suggestion} onSelect={() => {}} />
        </div>
      ))
      return (
        <>
          {existing}
          <div className="mt-4">Or we could create a new canvas type:</div>
          <NewCanvasSuggestionItem newCanvasSuggestion={message.newCanvasType} />
        </>
      )
}

export function SuggestionMessageDetails({ message, messageIndex }: { message: SuggestionMessage, messageIndex: number }) {
    const { formData, updateSection } = useCanvas()
    const { sendMessage, activeSection, setActiveSection, setActiveTool } = useChat()

    const handleAddSuggestion = (section: string, suggestion: string, rationale: string, suggestionId: string) => {
        if(!formData) {
            return
        }
        const sectionData = formData.sections.get(section) as Section
        const currentItems = sectionData?.items || []
        const newItems = [...currentItems, `${suggestion}\n\n${rationale}`]
        
        updateSection(section, newItems)
        // handleRemoveSuggestion(index, suggestionId)
    }

    const handleDismiss = (suggestionId: string) => {
        // handleRemoveSuggestion(index, suggestionId)
    }

    const handleExpand = async (suggestion: { suggestion: string }) => {
        const expandMessage = `Tell me more about "${suggestion.suggestion}"`
        sendMessage({
        role: 'user',
        content: expandMessage
        })
    }

    return (
        <div className="mt-2">
          <AnimatePresence initial={false}>
            {message.suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id || index}
                initial={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                animate={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <AISuggestionItem
                  suggestion={suggestion}
                  onLike={() => handleAddSuggestion(suggestion.section, suggestion.suggestion, suggestion.rationale, suggestion.id)}
                  onDismiss={() => handleDismiss(suggestion.id)}
                  onExpand={() => handleExpand(suggestion)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
    )
}

export function QuestionMessageDetails({ message }: { message: QuestionMessage}) {
    const { updateQuestionAnswer } = useCanvas()

    return (
        <div className="mt-2">
        {message.questions.map((question, index) => (
            <AIQuestionItem key={index} question={question} onSubmit={updateQuestionAnswer} />
        ))}
        </div>
    )
}

export function TrailPeroidEndedMessageDetails({ message }: { message: TrailPeroidEndedMessage }) {
    return (
      <div className="mt-2">
        <Button variant="outline" onClick={() => {
          window.location.href = '/pricing'
        }}>Upgrade</Button>
      </div>
    )
}