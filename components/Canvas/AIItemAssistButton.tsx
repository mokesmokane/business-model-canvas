'use client'

import React, { useState } from 'react'
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
  const { requestSuggestions } = useSectionItemAIEdit()

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
    }
  ]

  const handleAction = async (action: string, args?: any) => {
    console.log('action', action)
    if (action === 'suggestEdit') {
      setShowEditOptions(true)
      return
    }

    setIsDropdownOpen(false)
    onDropdownStateChange(false)

    if (action === 'diveIn') {
      onDiveIn()
    } else if (action === 'addEmojis') {
      var instruction = 'Add emojis to the item'
      if(args === 'words') {
        instruction = 'Add emojis to the item throughout the text where appropriate. Be liberal with it.  '
      } else if(args === 'sections') {
        instruction = 'Add an emoji to each paragraph'
      } else if(args === 'lists') {
        instruction = 'Add an emoji to each list item'
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
        instruction: args
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
        className={`w-48 transition-all duration-200 ease-in-out`}
      >
        {(showEditOptions ? editActions : mainActions).map(({ key, label, icon: Icon, subMenu, renderContent }) => (
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
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 