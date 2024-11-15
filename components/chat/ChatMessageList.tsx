import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, AlertTriangle, Users, Heart, Truck, Users2, Coins, Receipt, Building2, Workflow, Gift } from 'lucide-react'
import { Message } from '@/contexts/ChatContext'
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

interface ChatMessageListProps {
  messages: Message[]
  isLoading: boolean
  onSuggestionAdd: (messageIndex: number, section: string, suggestion: string, rationale: string, id: string) => void
  onSuggestionDismiss: (messageIndex: number, id: string) => void
  onSuggestionExpand: (suggestion: { suggestion: string }) => void
  onQuestionSubmit: (question: any) => void
  activeSection: string | null
  onSectionSelect: (section: string | null) => void
  onActionSelect: (action: { message: string, section: string, action: string }) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function ChatMessageList({
  messages,
  isLoading,
  onSuggestionAdd,
  onSuggestionDismiss,
  onSuggestionExpand,
  onQuestionSubmit,
  activeSection,
  onSectionSelect,
  onActionSelect,
  messagesEndRef
}: ChatMessageListProps) {

  const isEmptyChat = messages.length === 0
  const getMessage = (action: string, section: string) => {
    if(action === 'suggest') {
      return `Suggest items for ${section}`
    }
    if(action === 'critique') {
      return `Critique my ${section}`
    }
    if(action === 'research') {
      return `Suggest research for my ${section}`
    }
    else {
      return `Question me about my ${section}`
    }
  }
  const sectionsMap = {
    keyPartners: {
      key: 'keyPartners',
      name: "Key Partners",
      icon: <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    keyActivities: {
      key: 'keyActivities',
      name: "Key Activities",
      icon: <Workflow className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    keyResources: {
      key: 'keyResources',
      name: "Key Resources",
      icon: <Receipt className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    valuePropositions: {
      key: 'valuePropositions',
      name: "Value Propositions",
      icon: <Gift className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    customerRelationships: {
      key: 'customerRelationships',
      name: "Customer Relationships",
      icon: <Heart className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    channels: {
      key: 'channels',
      name: "Channels",
      icon: <Truck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    customerSegments: {
      key: 'customerSegments',
      name: "Customer Segments",
      icon: <Users2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    costStructure: {
      key: 'costStructure',
      name: "Cost Structure",
      icon: <Receipt className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    },
    revenueStreams: {
      key: 'revenueStreams',
      name: "Revenue Streams",
      icon: <Coins className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    }
  }
  const suggestions = {
    suggest: [
      ...Object.values(sectionsMap).map((section) => ({section: section, action: 'suggest'})),
    ],
      critique: [
        ...Object.values(sectionsMap).map((section) => ({section: section, action: 'critique'})),
    ],
    research: [
      ...Object.values(sectionsMap).map((section) => ({section: section, action: 'research'})),
    ],
    question: [
      ...Object.values(sectionsMap).map((section) => ({section: section, action: 'question'})),
    ]
  }

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isEmptyChat ? (
        <div className="h-full flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center justify-center gap-2">
              {selectedCategory ? (
                <>
                  {selectedCategory === 'research' ? <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" /> :
                   selectedCategory === 'suggest' ? <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" /> :
                   selectedCategory === 'critique' ? <MessageCircle className="h-5 w-5 text-green-500 dark:text-green-400" /> :
                   <HelpCircle className="h-5 w-5 text-purple-500 dark:text-purple-400" />}
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
                    {suggestions[selectedCategory as keyof typeof suggestions].map((suggestion: any, index: number) => (
                      <motion.div
                        key={suggestion.section.key + suggestion.action}
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
                            {suggestion.section.icon}
                            {getMessage(suggestion.action, suggestion.section.name)}
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: suggestions[selectedCategory as keyof typeof suggestions].length * 0.1 }}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                        border-gray-200 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSelectedCategory('suggest')}
                    >
                      <Lightbulb className="w-4 h-4  text-amber-500 dark:text-amber-400" />
                      Suggest
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                        border-gray-200 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSelectedCategory('critique')}
                    >
                      <MessageCircle className="w-4 h-4  text-green-500 dark:text-green-400" />
                      Critique
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                        border-gray-200 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSelectedCategory('research')}
                    >
                      <Search className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      Research
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                        border-gray-200 dark:border-gray-700 
                        bg-gray-50 dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSelectedCategory('question')}
                    >
                      <HelpCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      Question Me
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
            {message.suggestions && (
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
                        onLike={() => onSuggestionAdd(messageIndex, suggestion.section, suggestion.suggestion, suggestion.rationale, suggestion.id)}
                        onDismiss={() => onSuggestionDismiss(messageIndex, suggestion.id)}
                        onExpand={() => onSuggestionExpand(suggestion)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {message.questions && (
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
                    onSubmit={onQuestionSubmit}
                  />
                ))}
              </motion.div>
            )}
          </div>
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Bot className="w-4 h-4 text-muted-foreground" />
          </div>
          <AIThinkingIndicator />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
  <div className="flex-shrink-0">
    <SectionButtons 
      activeSection={activeSection}
      onSectionSelect={onSectionSelect}
    />
    <div className={`transition-all duration-200 ease-in-out ${
      activeSection 
        ? 'opacity-100 max-h-20 translate-y-0' 
        : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
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
  </div>
        </>
      )}
    </div>
  )
}