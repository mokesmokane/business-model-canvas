import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, AlertTriangle, Users, Heart, Truck, Users2, Coins, Receipt, Building2, Workflow, Gift, Shield } from 'lucide-react'
import { Message, AdminMessage, useChat } from '@/contexts/ChatContext'
import { AIThinkingIndicator } from '@/components/ui/ai-thinking'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import AISuggestionItem from './AISuggestionItem'
import AIQuestionItem from './AIQuestionItem'
import { SectionButtons } from './SectionButtons'
import { ActionButtons } from './ActionButtons'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, HelpCircle, Zap, MessageCircle, Lightbulb } from 'lucide-react'
import { AdminButtonBar } from './AdminButtonBar'
import DynamicIcon from '../Util/DynamicIcon'
import { CanvasTypeService } from '@/services/canvasTypeService'
import { CanvasLayoutDetails, CanvasSection, CanvasType } from '@/types/canvas-sections'
import { useCanvas } from '@/contexts/CanvasContext'
import { AIQuestion } from '@/types/canvas'
import { getMessageRenderer } from './messages/messageRendererFactory'

interface ChatMessageListProps {
  messages: Message[]
  useCanvasContext: boolean,
  onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void
  onSuggestionDismiss: (messageIndex: number, id: string) => void
  onSuggestionExpand: (suggestion: { suggestion: string }) => void
  onQuestionSubmit: (question: AIQuestion) => void
  activeSection: string | null
  activeTool: string | null
  onSectionSelect: (section: string | null) => void
  onActionSelect: (action: { message: string, section: string, action: string }) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  onAdminToolSelect: (tool: string | null) => void
  selectedInteraction: string | null
  setSelectedInteraction: (interaction: string | null) => void
}

interface CanvasTypeSuggestion {
  name: string;
  description: string;
  icon: string;
  rationale: string;
  sections: any[]; // You may want to type this more specifically based on your data structure
  defaultLayout: CanvasLayoutDetails;
}

export function ChatMessageList({
  messages,
  useCanvasContext,
  onSuggestionAdd,
  onSuggestionDismiss,
  onSuggestionExpand,
  onQuestionSubmit,
  activeSection,
  activeTool,
  onSectionSelect,
  onActionSelect,
  messagesEndRef,
  onAdminToolSelect,
  selectedInteraction,
  setSelectedInteraction
}: ChatMessageListProps) {

  const messageRenderer = getMessageRenderer( selectedInteraction, onSuggestionAdd, onSuggestionDismiss, onSuggestionExpand, onQuestionSubmit)

  const isEmptyChat = messages.length === 0
  const getMessage = (action: string, section: string) => {
    if(action === 'suggest') {
      return `Suggest items for ${section}`
    }
    if(action === 'critique') {
      return `Critique ${section}`
    }
    if(action === 'research') {
      return `Suggest research for ${section}`
    }
    else {
      return `Question me about ${section}`
    }
  }
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAdminTool, setShowAdminTool] = useState(false)
  const { isLoading, loadingMessage } = useChat()
  const { formData, currentCanvas } = useCanvas()
  const sectionsMap = currentCanvas?.canvasType?.sections.reduce((acc: any, section: CanvasSection) => {
    acc[section.name] = {
      name: section.name,
      icon: section.icon
    };
    return acc;
  }, {}) || {};


  const options = {
    suggest: {
      icon: Lightbulb,
      iconClassName: 'text-amber-500 dark:text-amber-400',
      label: 'Suggest',
      requiresContext: true,
      action: 'suggest',
      sectionOptions: Object.values(sectionsMap).map((section) => ({section: section, action: 'suggest'})),
      interactionOptions: []
    },
    critique: {
      icon: MessageCircle,
      iconClassName: 'text-green-500 dark:text-green-400',
      label: 'Critique',
      action: 'critique',
      requiresContext: true,
      sectionOptions: Object.values(sectionsMap).map((section) => ({section: section, action: 'critique'})),
      interactionOptions: []
    },
    research: {
      icon: Search,
      iconClassName: 'text-blue-500 dark:text-blue-400',
      label: 'Research',
      action: 'research',
      requiresContext: true,
      sectionOptions: Object.values(sectionsMap).map((section) => ({section: section, action: 'research'})),
      interactionOptions: []
    },
    question: {
      icon: HelpCircle,
      iconClassName: 'text-purple-500 dark:text-purple-400',
      label: 'Question Me',
      action: 'question',
      requiresContext: true,
      sectionOptions: Object.values(sectionsMap).map((section) => ({section: section, action: 'question'})),
      interactionOptions: []
    },
    create: {
      icon: Zap,
      iconClassName: 'text-muted-foreground',
      label: 'Create',
      action: 'create',
      requiresContext: false,
      sectionOptions: [],
      interactionOptions: [
        {
          interaction: 'createCanvas',
          label: 'Create New Canvas'
        }
      ]
    }
  }

  const Icon = options[selectedCategory as keyof typeof options]?.icon
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isEmptyChat && !showAdminTool ? (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center justify-center gap-2">
              {selectedCategory ? (
                <>
                  {Icon && <Icon className="h-5 w-5" />}
                  {`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Ideas`}
                </>
              ) : (
                <>
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  'How can I help you today?'
                </>
              )}
            </h3>
            <motion.div
              layout
              className="flex justify-center"
            >
              <AnimatePresence mode="wait">
                {selectedCategory ? (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, height: "48px", marginBottom: "0.5rem" }}
                    animate={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                    exit={{ opacity: 0, height: "48px", marginBottom: 0 }}
                    transition={{ 
                      height: { duration: 0.3, ease: "easeOut" },
                      opacity: { duration: 0.2 }
                    }}
                    className="flex flex-col gap-2 max-w-sm mx-auto overflow-hidden"
                    style={{ minHeight: "48px" }}
                  >
                    {options[selectedCategory as keyof typeof options].sectionOptions.map((suggestion: any, index: number) => (
                      <motion.div
                        key={suggestion.section.name + suggestion.action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full text-left justify-start text-muted-foreground hover:text-foreground
                            border-gray-200 dark:border-gray-700 
                            bg-gray-50 dark:bg-gray-900 
                            hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            onActionSelect({
                              message: getMessage(suggestion.action, suggestion.section.name),
                              section: suggestion.section.key,
                              action: suggestion.action
                            })
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={suggestion.section.icon} className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            {getMessage(suggestion.action, suggestion.section.name)}
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                    {options[selectedCategory as keyof typeof options].interactionOptions.map((interaction: any, index: number) => (
                      <motion.div
                        key={interaction.interaction}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (options[selectedCategory as keyof typeof options].sectionOptions.length + index * 0.1 )}}
                      >
                        <Button
                          variant="ghost"
                          className="w-full mt-2 text-muted-foreground"
                          onClick={() => {
                            setSelectedCategory(null)
                            setSelectedInteraction(interaction.interaction)
                          }}
                        >
                          {interaction.label}
                        </Button>
                      </motion.div>
                    ))}
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (options[selectedCategory as keyof typeof options].sectionOptions.length + options[selectedCategory as keyof typeof options].interactionOptions.length) * 0.1 }}
                    >
                      <Button
                          variant="ghost"
                          className="w-full mt-2 text-muted-foreground"
                          onClick={() => setSelectedCategory(null)}
                      >
                          ← Back
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, height: "auto" }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: "48px" }}
                    transition={{ 
                      height: { duration: 0.3, ease: "easeOut" },
                      opacity: { duration: 0.2 }
                    }}
                    className="flex flex-wrap justify-center gap-2"
                    style={{ minHeight: "48px" }}
                  >
                    {Object.values(options).filter((option) => (useCanvasContext && option.requiresContext && currentCanvas) || ((!useCanvasContext && !option.requiresContext) ||(!currentCanvas && !option.requiresContext))).map((option) => (
                      <Button
                        key={option.action}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                          border-gray-200 dark:border-gray-700 
                          bg-gray-50 dark:bg-gray-900 
                          hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setSelectedCategory(option.action)}
                      >
                        {option.icon && <option.icon className={`w-4 h-4 ${option.iconClassName}`} />}
                        {option.label}
                      </Button>
                    ))}
                    <Button
                      key="admin"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                        border-gray-200 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        setShowAdminTool(true)
                        setSelectedCategory(null)
                      }}
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Admin
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
            {messageRenderer.render(
              messages
            )}
              
      {isLoading && (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Bot className="w-4 h-4 text-muted-foreground" />
          </div>
          <AIThinkingIndicator message={loadingMessage} />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
  <div className="flex-shrink-0 flex flex-col">
    {showAdminTool ? (
      <AdminButtonBar activeTool={activeTool} onToolSelect={(tool) => {
        onAdminToolSelect(tool)
        if(!tool) {
          setShowAdminTool(false)
        }
      }} />
    ) : (
      <>
        <SectionButtons 
          activeSection={activeSection}
          onSectionSelect={onSectionSelect}
        />
        <div className={`transition-all duration-200 ease-in-out overflow-hidden ${
          activeSection 
            ? 'opacity-100 h-12 translate-y-0' 
            : 'opacity-0 h-0 translate-y-2 pointer-events-none'
        }`}>
          <ActionButtons
            onActionSelect={(action) => {
              if(activeSection) {
                onActionSelect({
                  message: getMessage(action, sectionsMap[activeSection as keyof typeof sectionsMap].name),
                  section: activeSection,
                  action: action
                })
              }
            }}
          />
        </div>
      </>
    )}
  </div>
        </>
      )}
    </div>
  )
}