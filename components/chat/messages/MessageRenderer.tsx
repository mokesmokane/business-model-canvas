import { Message, CanvasTypeSuggestionMessage, SuggestionMessage, QuestionMessage, AdminMessage, useChat, TrailPeroidEndedMessage, SubscriptionRequiredMessage, SuggestEditMessage } from "@/contexts/ChatContext"
import { Bot, User, AlertTriangle, X, Check, ThumbsUp, Plus, Loader2, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { motion, AnimatePresence } from "framer-motion"
import AISuggestionItem from "../AISuggestionItem"
import AIQuestionItem from "../AIQuestionItem"
import CanvasSuggestionItem from "./CanvasSuggestionItem"
import NewCanvasSuggestionItem from "./NewCanvasSuggestionItem"
import { Section, TextSectionItem } from "@/types/canvas"
import { useCanvas } from "@/contexts/CanvasContext"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from 'uuid'
import { CanvasLayoutDetails, CanvasType } from "@/types/canvas-sections"
import { useCanvasFolders } from "@/contexts/CanvasFoldersContext"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from 'react'
import { canvasTypeService, CanvasTypeService } from '@/services/canvasTypeService';
import { toast } from "react-hot-toast"
import DynamicIcon from '@/components/Util/DynamicIcon'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


interface MessageRendererProps {
  message: Message
  messageIndex: number
  messageHistory: Message[]
}

export function MessageRenderer({ message, messageIndex, messageHistory}: MessageRendererProps) {
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
    if (message.type === 'canvasType') {
      return <CanvasTypeSuggestionMessageDetails message={message as CanvasTypeSuggestionMessage} messageHistory={messageHistory} />
    }

    if (message.type === 'suggestion') {
      return <SuggestionMessageDetails message={message as SuggestionMessage} messageIndex={messageIndex} />
    }

    if (message.type === 'question') {
      return <QuestionMessageDetails message={message as QuestionMessage} />
    }

    if (message.type === 'trailPeriodEnded') {
      return <TrailPeroidEndedMessageDetails message={message as TrailPeroidEndedMessage} />
    }

    if (message.type === 'subscriptionRequired') {
      return <SubscriptionRequiredMessageDetails message={message as SubscriptionRequiredMessage} />
    }

    if (message.type === 'suggestEdit') {
      return <SuggestEditMessageDetails message={message as SuggestEditMessage} />
    }

    if (message.type === 'admin') {
      return <AdminMessageDetails message={message as AdminMessage} />
    }

    return null
  }

  return (
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

export function CanvasTypeSuggestionMessageDetails({ message, messageHistory }: { message: CanvasTypeSuggestionMessage, messageHistory: Message[] }) {
  const { rootFolderId } = useCanvasFolders()
  const { createNewCanvasAndNameIt, loadCanvas } = useCanvas()
  const router = useRouter()


  const handleSubmit = async (canvasType: CanvasType) => {
    if (!canvasType) {
      return
    }
    const newCanvas = await createNewCanvasAndNameIt({
      canvasType: canvasType,
      folderId: rootFolderId,
      messageHistory: messageHistory
    })
    
    if (newCanvas) {
      await loadCanvas(newCanvas.id)
      localStorage.setItem('lastCanvasId', newCanvas.id)
      router.push(`/canvas/${newCanvas.id}`)
    }
  }

  const existing = message.canvasTypes.map((suggestion) => (
      <div key={suggestion}>
        <CanvasSuggestionItem canvasTypeId={suggestion} onSubmit={handleSubmit}/>
      </div>
    ))
    return (
      <>
        {existing}
        <ReactMarkdown className="prose dark:prose-invert prose-sm">
        Or we could create a new canvas type:
        </ReactMarkdown>
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
        const currentItems = sectionData?.sectionItems || []
        const newItems = [...currentItems, new TextSectionItem(uuidv4(), `${suggestion}\n\n${rationale}`)]
        
        updateSection(section, newItems)
        // handleRemoveSuggestion(index, suggestionId)
    }

    const handleDismiss = (suggestionId: string) => {
        // handleRemoveSuggestion(index, suggestionId)
    }

    const handleExpand = async (suggestion: { suggestion: string }) => {
        const expandMessage = `Tell me more about "${suggestion.suggestion}"`
        sendMessage({
          type: 'text',
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
        <p>{message.content}</p>
        <Button variant="outline" onClick={() => {
          window.location.href = '/pricing'
        }}>Upgrade</Button>
      </div>
    )
}

export function SubscriptionRequiredMessageDetails({ message }: { message: SubscriptionRequiredMessage }) {
    return (
        <div className="mt-2">
            <p>{message.content}</p>
            <Button variant="outline" onClick={() => {
                window.location.href = '/pricing'
            }}>Upgrade</Button>
        </div>
    )
}

export function SuggestEditMessageDetails({ message }: { message: SuggestEditMessage }) {
    const { formData, updateItem } = useCanvas()
    const [isRemoving, setIsRemoving] = useState(false)
    const [isAccepted, setIsAccepted] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    return (
        <div className="mt-2 space-y-3">
            <Card className={`border-2 dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-200 ${
                isRemoving
                    ? isAccepted
                        ? 'opacity-50'
                        : isDismissed
                            ? 'opacity-50 line-through'
                            : ''
                    : ''
                } transition-all duration-500`}
            >
                <CardContent className="p-3 relative">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            <p className="text-sm mb-1 dark:text-gray-200 text-gray-700">
                                {message.itemEdit}
                            </p>
                            <p className="text-xs dark:text-gray-400 text-gray-500">
                                {message.rationale}
                            </p>
                        </div>
                    </div>
                    <div className={`flex gap-1 mt-2 justify-end transition-opacity duration-300 ${
                        isRemoving ? 'opacity-0' : 'opacity-100'
                    }`}>
                        <Button
                            size="sm"
                            variant="ghost"
                            className={`${
                                isAccepted 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'dark:text-gray-400 text-gray-500 dark:hover:text-gray-100 hover:text-gray-900'
                            }`}
                            onClick={() => {
                                updateItem(message.section, new TextSectionItem(message.item, message.itemEdit))
                                setIsAccepted(true)
                                setIsRemoving(true)
                            }}
                            disabled={isRemoving}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="dark:text-gray-400 text-gray-500 dark:hover:text-gray-100 hover:text-gray-900"
                            onClick={() => {
                                setIsDismissed(true)
                                setIsRemoving(true)
                            }}
                            disabled={isRemoving}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function AdminMessageDetails({ message }: { message: AdminMessage }) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const handleSaveCanvasType = async (canvasType: CanvasType) => {
        setSaving(true)
        setError(null)
        try {
            await canvasTypeService.saveCanvasType(canvasType)
            toast.success("Canvas type saved successfully")
        } catch (err) {
            setError("Failed to save canvas type")
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleSaveLayout = async (layout: CanvasLayoutDetails) => {
        setSaving(true)
        setError(null)
        try {
            await canvasTypeService.saveLayout(layout)
            toast.success("Canvas layout saved successfully")
        } catch (err) {
            setError("Failed to save layout")
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const renderSuggestion = () => {
        if (message.canvasTypeSuggestions.length > 0) {
            const suggestion = message.canvasTypeSuggestions[0] as CanvasType
            return (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DynamicIcon name={suggestion.icon} className="h-5 w-5" />
                            {suggestion.name}
                        </CardTitle>
                        <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {suggestion.defaultLayout && (
                            <div className="mt-2">
                                <div className="w-full h-32">
                                    <div
                                        className="w-full h-full grid gap-1"
                                        style={{
                                            gridTemplateColumns: suggestion.defaultLayout.layout.gridTemplate.columns,
                                            gridTemplateRows: suggestion.defaultLayout.layout.gridTemplate.rows,
                                        }}
                                    >
                                        {suggestion.sections.map((section, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/20 bg-primary/5"
                                                style={{
                                                    gridArea: suggestion.defaultLayout?.layout.areas?.[index] || 'auto',
                                                }}
                                            >
                                                <DynamicIcon name={section.icon} className="w-4 h-4 text-primary" />
                                                <span className="text-xs text-primary">{section.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleSaveCanvasType(suggestion)}
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add Canvas Type
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }
      
        if (message.canvasLayoutSuggestions.length > 0) {
            const layout = message.canvasLayoutSuggestions[0]
            return (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>{layout.areas}</CardTitle>
                        <CardDescription>{layout.rationale}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">
                            <div className="w-full h-32">
                                <div
                                    className="w-full h-full grid gap-1"
                                    style={{
                                        gridTemplateColumns: layout.gridTemplate.columns,
                                        gridTemplateRows: layout.gridTemplate.rows,
                                    }}
                                >
                                    {layout.areas.map((area, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center rounded-md border-2 border-dashed border-primary/20 bg-primary/5"
                                            style={{ gridArea: area }}
                                        >
                                            <span className="text-xs text-primary">Section {index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                // onClick={() => handleSaveLayout(layout)}
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add Layout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return <p className="mt-2">{message.content}</p>
    }

    return (
        <div className="mt-2">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {renderSuggestion()}
        </div>
    )
}