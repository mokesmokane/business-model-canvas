

import { Button } from "@/components/ui/button"
import { AdminMessage, Message, QuestionMessage, SuggestionMessage } from "@/contexts/ChatContext"
import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import { AlertTriangle, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import AISuggestionItem from "../AISuggestionItem"
import AIQuestionItem from "../AIQuestionItem"
import { CanvasType } from "@/types/canvas-sections"
import { CanvasTypeService } from "@/services/canvasTypeService"
import DynamicIcon from "@/components/Util/DynamicIcon"
import { MessageRendererProps } from "./MessageRendererInterface"
import { canvasTypeService } from "@/services/canvasTypeService";

const handleSaveCanvasType = async (suggestion: any) => {
  try {
    const canvasType: CanvasType = {
      id: '', // This will be set by Firestore
      name: suggestion.name,
      description: suggestion.description,
      icon: suggestion.icon,
      sections: suggestion.sections || [],
      defaultLayout: suggestion.defaultLayout
    };
    
    await canvasTypeService.saveCanvasType(canvasType);
    // You might want to add some success feedback here
  } catch (error) {
    console.error('Error saving canvas type:', error);
    // You might want to add some error feedback here
  }
};

export function getErrorMessage(error: any) {
  return error.message || 'An error occurred'
}

export function renderDefaultMessages(messages: Message[], addExtraMessageStuff: (message: Message, messageIndex: number) => React.ReactNode) {
  return <>
        {messages.map((message, messageIndex) => (
        <div key={messageIndex} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
          )}
          <div className={`max-w-[600px] rounded-lg p-3 ${
            message.role === 'user' 
              ? 'bg-muted text-mut-foreground dark:bg-secondary dark:text-secondary-foreground' 
              : message.role === 'assistant'
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
              : 'bg-destructive/50 text-destructive-foreground'
          }`}>
            {message.role === 'error' ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>{message.content}</span>
              </div>
            ) : (
              <ReactMarkdown className="prose dark:prose-invert prose-sm">
                {message.content}
              </ReactMarkdown>
            )}
            {addExtraMessageStuff && addExtraMessageStuff(message, messageIndex)}
          </div>
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          )}
        </div>
      ))}
    </>
}

export function defaultExtraMessageStuff(message: Message, messageIndex: number, onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void, onSuggestionDismiss: (messageIndex: number, id: string) => void, onSuggestionExpand: (suggestion: { suggestion: string }) => void, onQuestionSubmit: (question: any) => void) {
  return <>
    {message instanceof AdminMessage && message.canvasTypeSuggestions && (
    <div className="mt-4 space-y-3">
      <h4 className="font-medium text-sm">Suggested Canvas Types:</h4>
      {(message as AdminMessage).canvasTypeSuggestions?.map((suggestion, index) => (
        <div key={index} className="bg-background/50 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* <DynamicIcon name={suggestion.icon} className="w-5 h-5" /> */}
              <h5 className="font-medium">name:{suggestion.name}</h5>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveCanvasType(suggestion)}
              className="text-blue-500 hover:text-blue-600"
            >
              Save Canvas Type
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
          <div className="text-sm">
            <strong className="text-foreground">Rationale:</strong> {suggestion.rationale}
          </div>
          
          {suggestion.sections && suggestion.sections.length > 0 && (
            <div className="mt-3">
              <h6 className="font-medium text-sm mb-2">Sections:</h6>
              <div className="grid grid-cols-2 gap-2">
                {suggestion.sections.map((section, sIdx) => (
                  <div key={sIdx} className="bg-background/30 p-2 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <DynamicIcon name={section.icon} className="w-4 h-4" />
                      <span className="font-medium text-sm">{section.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{section.placeholder}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestion.defaultLayout && (
            <div className="mt-2 text-sm">
              <strong className="text-foreground">Layout:</strong> {suggestion.defaultLayout.name}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {message instanceof SuggestionMessage && message.suggestions && (
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
              onLike={() => onSuggestionAdd && onSuggestionAdd(messageIndex, suggestion.section, suggestion.suggestion, suggestion.rationale, suggestion.id)}
              onDismiss={() => onSuggestionDismiss && onSuggestionDismiss(messageIndex, suggestion.id)}
              onExpand={() => onSuggestionExpand && onSuggestionExpand(suggestion)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )}

  {message instanceof QuestionMessage && message.questions && (
    <motion.div
      key="questions"
      initial={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
      animate={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {message.questions.map((question: any, index: number) => (
        <AIQuestionItem
          key={index}
          question={question}
          onSubmit={() => onQuestionSubmit && onQuestionSubmit(question)}
        />
      ))}
    </motion.div>
    )}
  </>
}

export function DefaultMessageRenderer({ onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit }: MessageRendererProps) {
    return {
      render: (messages: Message[]) => renderDefaultMessages(messages, (message: Message, messageIndex: number) => defaultExtraMessageStuff(message, messageIndex, onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit))
    }
}