'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  Lightbulb,
  MessageCircle,
  ArrowRight,
  SmilePlus,
  BookOpen,
  Expand,
  LucideIcon,
  SplitSquareHorizontal,
  ListOrdered,
  XCircle,
  Type,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { createRequestSuggestEditMessage, createTextMessage, useChat } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { SectionItem as SectionItemType } from '@/types/canvas'
import { useSectionItemAIEdit } from '@/contexts/SectionItemAIEditContext'
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface AIItemAssistButtonProps {
  section: string
  content: string
  item?: SectionItemType
  onExpandSidebar: () => void
  onDiveIn: () => void
  onDropdownStateChange: (isOpen: boolean) => void
}

interface ActionItem {
  key: string
  label: string
  icon: LucideIcon
  subMenu?: boolean
  renderContent?: () => React.ReactNode
}

export function AIItemAssistButton({ 
  section,
  content, 
  item,
  onExpandSidebar,
  onDiveIn,
  onDropdownStateChange 
}: AIItemAssistButtonProps) {
  const { sendMessage, isLoading } = useChat()
  const { formData, canvasTheme } = useCanvas()
  const { requestSuggestions, resetState } = useSectionItemAIEdit()
  const [isMobile, setIsMobile] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<'main' | 'edit' | string>('main')

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical mobile breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [showEditOptions, setShowEditOptions] = useState(false)
  const [lengthValue, setLengthValue] = useState([4])
  const [readingLevelValue, setReadingLevelValue] = useState([3])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [customInstruction, setCustomInstruction] = useState('')

  const mainActions: ActionItem[] = [
    { key: 'critique', label: 'Critique', icon: MessageCircle },
    { key: 'suggestEdit', label: 'Suggest Edit', icon: Lightbulb },
    { key: 'diveIn', label: item?.canvasLink ? 'Open Canvas Link' : 'Dive In', icon: ArrowRight },
  ]

  const emojiOptions = [
    { value: 'words', label: 'Words', icon: SmilePlus },
    { value: 'sections', label: 'Sections', icon: SplitSquareHorizontal },
    { value: 'lists', label: 'Lists', icon: ListOrdered },
    { value: 'remove', label: 'Remove All', icon: XCircle },
  ]

  const readingLevels = [
    'Kindergarten',
    'Elementary',
    'Middle School',
    'Current Level',
    'High School',
    'College',
    'Graduate School'
  ]

  const formatOptions = [
    { value: 'key-points', label: 'Highlight Key Points', description: 'Bold important concepts and italicize supporting details' },
    { value: 'emphasis', label: 'Add Emphasis', description: 'Strategically bold and italicize for better readability' },
    { value: 'structured', label: 'Structure Format', description: 'Bold headings and italicize quotes/definitions' },
    { value: 'minimal', label: 'Minimal Highlights', description: 'Light formatting for essential elements only' },
    { value: 'remove', label: 'Remove Formatting', description: 'Remove all markdown formatting' }
  ]

  const formatInstructions: Record<string, string> = {
    'key-points': 'Add markdown formatting by making key concepts and main points bold (**) and supporting details or explanations italic (_). Focus on highlighting the most important information.',
    'emphasis': 'Add markdown formatting to create natural emphasis in the text. Use bold (**) for strong emphasis and italic (_) for subtle emphasis. Format it in a way that helps with reading flow and comprehension.',
    'structured': 'Add markdown formatting in a structured way: make all headings and section titles bold (**), use italics (_) for quotes, definitions, and specialized terms.',
    'minimal': 'Add minimal markdown formatting, using bold (**) only for the most critical points and italic (_) very sparingly for special emphasis.',
    'remove': 'Remove all markdown formatting (**, _, ##, etc.) from the text while preserving the actual content.'
  }

  const editActions: ActionItem[] = [
    { 
      key: 'customInstruct', 
      label: 'Custom Instruction', 
      icon: MessageCircle,
      subMenu: true,
      renderContent: () => (
        <div className="p-2 space-y-2 w-[250px]">
          <DropdownMenuLabel>Custom Instruction</DropdownMenuLabel>
          <Input
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="Enter your instruction..."
            className="mb-2"
          />
          <Button 
            onClick={() => handleAction('customInstruct', customInstruction)}
            className="w-full"
            disabled={!customInstruction.trim()}
          >
            Apply
          </Button>
        </div>
      )
    },
    { 
      key: 'addEmojis', 
      label: 'Add Emojis', 
      icon: SmilePlus,
      subMenu: true,
      renderContent: () => (
        <div className="p-2 space-y-2">
          <div className="flex flex-col gap-2">
            {emojiOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleAction(`addEmojis`, option.value)}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )
    },
    { 
      key: 'readingLevel', 
      label: 'Reading Level', 
      icon: BookOpen,
      subMenu: true,
      renderContent: () => (
        <div className="p-2 space-y-2 w-[200px]">
          <DropdownMenuLabel>Reading Level</DropdownMenuLabel>
          <Slider
            value={readingLevelValue}
            onValueChange={setReadingLevelValue}
            max={6}
            step={1}
            className="my-4"
          />
          <div className="text-sm text-center">
            {readingLevels[readingLevelValue[0]]}
          </div>
          <Button 
            onClick={() => handleAction(`readingLevel`, readingLevelValue[0])}
            className="w-full mt-2"
          >
            Apply
          </Button>
        </div>
      )
    },
    { 
      key: 'adjustLength', 
      label: 'Adjust Length', 
      icon: Expand,
      subMenu: true,
      renderContent: () => (
        <div className="p-2 space-y-2 w-[200px]">
          <DropdownMenuLabel>Length Adjustment</DropdownMenuLabel>
          <Slider
            value={lengthValue}
            onValueChange={setLengthValue}
            max={6}
            step={1}
            className="my-4"
          />
          <Button 
            onClick={() => handleAction(`adjustLength`, lengthValue[0])}
            className="w-full mt-2"
          >
            Apply
          </Button>
        </div>
      )
    },
    { 
      key: 'formatText', 
      label: 'Format Text', 
      icon: Type,
      subMenu: true,
      renderContent: () => (
        <div className="p-2 space-y-2">
          <div className="flex flex-col gap-2">
            {formatOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleAction('formatText', option.value)}
                variant="outline"
                className="w-full justify-start text-left"
              >
                <div>
                  <div>{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )
    }
  ]

  const handleAction = async (action: string, args?: string | number) => {
    console.log('action', action)
    if (action === 'suggestEdit') {
      setShowEditOptions(true)
      return
    }

    setIsDropdownOpen(false)
    setShowEditOptions(false)
    onDropdownStateChange(false)
    resetState()

    if (action === 'diveIn') {
      onDiveIn()
    } else if (action === 'addEmojis') {
      var instruction = 'Add emojis to the item'
      if(args === 'words') {
        instruction = 'Add emojis to the item throughout the text where appropriate. Be liberal with it. If its a list or a title, add an emoji before rather than after the text. If its in the middle of a sentence or paragraph, add an emoji after the text.'
      } else if(args === 'sections') {
        instruction = 'Add an emoji to the start of each paragraph'
      } else if(args === 'lists') {
        instruction = 'Add an emoji to the start of each list item'
      } else if(args === 'remove') {
        instruction = 'Remove all emojis'
      }
      if(!formData || !item) {
        return
      }

      requestSuggestions({
        currentContent: formData,
        section: section,
        item: item,
        instruction: instruction
      })
    } else if (action === 'readingLevel') {
      var instruction = `Edit the ${content} to be at a reading level of ${readingLevels[readingLevelValue[0]]}`
      if(!formData || !item) {
        return
      }

      requestSuggestions({
        currentContent: formData,
        section: section,
        item: item,
        instruction: instruction
      })
    } else if (action === 'adjustLength') {
      //INTRUCTIONS:
const length0 = `Concise (50% shorter)
Make this half as long while keeping the main idea intact`

const length1 = `Brief (25% shorter)
Trim this by about a quarter, focusing on the essentials`

const length2 = `Compact (10% shorter)
Reduce this slightly by about 10%, keeping it concise`

const length3 = `Current Length
Keep the current length unchanged`

const length4 = `Expanded (25% longer)
Add a bit more detail—expand by about 25%`

const length5 = `Detailed (50% longer)
Provide more information—make this about 50% longer`

const length6 = `Thorough (100% longer)
Elaborate significantly—extend this to about 100% longer`

      var instruction = args === 0 ? length0 : args === 1 ? length1 : args === 2 ? length2 : args === 3 ? length3 : args === 4 ? length4 : args === 5 ? length5 : length6
      if(!formData || !item) {
        return
      }

      requestSuggestions({
        currentContent: formData,
        section: section,
        item: item,
        instruction: instruction
      })
    } else if (action === 'customInstruct') {
      if(!formData || !item) {
        return
      }

      requestSuggestions({
        currentContent: formData,
        section: section,
        item: item,
        instruction: args as string
      })
    } else if (action === 'formatText') {
      if(!formData || !item) {
        return
      }

      requestSuggestions({
        currentContent: formData,
        section: section,
        item: item,
        instruction: `Format this text using markdown: ${formatInstructions[args as keyof typeof formatInstructions]}`
      })
    }
      
    else {
      onExpandSidebar()
      const actionMessage = action === 'question' 
        ? createTextMessage(`Question me about ${content}`) 
        : action === 'critique' 
        ? createTextMessage(`Critique the ${content}`) 
        : createTextMessage(`Suggest things for ${content}`)

      await sendMessage(actionMessage, action)
    }
  }

  return (
    <DropdownMenu 
      open={isDropdownOpen}
      onOpenChange={(isOpen) => {
        setIsDropdownOpen(isOpen)
        if (!isOpen) {
          setShowEditOptions(false)
          setCurrentMenu('main')
          resetState()
          onDropdownStateChange(false)
        } else {
          onDropdownStateChange(true)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="icon"
          canvasTheme={canvasTheme}
          className="ml-2"
        >
          <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        canvasTheme={canvasTheme}
        align="end" 
        className={`transition-all duration-200 ease-in-out ${
          isMobile && (currentMenu === 'customInstruct') ? 'w-[260px]' : currentMenu === 'formatText' ? 'w-[350px]' : 'w-48'
        }`}
      >
        {isMobile ? (
          // Mobile: Flat menu structure
          currentMenu === 'main' ? (
            (showEditOptions ? editActions : mainActions).map(({ key, label, icon: Icon, subMenu }) => (
              <DropdownMenuItem
                key={key}
                onClick={(e) => {
                  if (key === 'suggestEdit') {
                    e.preventDefault()
                    setShowEditOptions(true)
                    return
                  }
                  if (subMenu) {
                    e.preventDefault()
                    setCurrentMenu(key)
                    return
                  }
                  handleAction(key)
                }}
                className="flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 ${
                  canvasTheme === 'light'
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`} />
                {label}
                {subMenu && <ChevronRight className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))
          ) : (editActions.find(a => a.key === currentMenu)?.renderContent?.())
        ) : (
          // Desktop: Original nested menu structure
          (showEditOptions ? editActions : mainActions).map(({ key, label, icon: Icon, subMenu, renderContent }) => (
            subMenu ? (
              <DropdownMenuSub key={key}>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${
                    canvasTheme === 'light'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`} />
                  {label}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {renderContent?.()}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem
                key={key}
                onClick={(e) => {
                  if (key === 'suggestEdit') {
                    e.preventDefault()
                  }
                  handleAction(key)
                }}
                className="flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 ${
                  canvasTheme === 'light'
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`} />
                {label}
              </DropdownMenuItem>
            )
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 