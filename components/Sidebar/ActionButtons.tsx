import { Button } from '@/components/ui/button'
import { useExpanded } from '@/contexts/ExpandedContext';
import { Lightbulb, HelpCircle, MessageCircle, Search } from 'lucide-react'

const actions = [
  { key: 'suggest', label: 'Suggest', icon: Lightbulb },
  { key: 'question', label: 'Question Me', icon: HelpCircle },
  { key: 'critique', label: 'Critique', icon: MessageCircle },
  { key: 'research', label: 'Research', icon: Search },
]

interface ActionButtonsProps {
  onActionSelect: (action: string) => void;
}

export function ActionButtons({ onActionSelect }: ActionButtonsProps) {
  const { isWide } = useExpanded()
  return (
    <div className={`flex gap-2 px-2 py-2 ${isWide ? 'justify-start' : 'justify-evenly'}`}>
      {actions.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className={`
            border-gray-200 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900 
            text-gray-600 dark:text-gray-400 
            hover:bg-gray-100 hover:text-gray-900
            dark:hover:bg-gray-800 dark:hover:text-gray-100
            ${isWide ? 'flex gap-2 items-center' : ''}
          `}
          onClick={() => onActionSelect(key)}
        >
          {isWide && <Icon size={16} />}
          {label}
        </Button>
      ))}
    </div>
  )
} 