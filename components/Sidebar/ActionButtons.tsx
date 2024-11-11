import { Button } from '@/components/ui/button'

const actions = [
  { key: 'suggest', label: 'Suggest' },
  { key: 'question', label: 'Question Me' },
  { key: 'critique', label: 'Critique' },
  { key: 'research', label: 'Research' },
]

interface ActionButtonsProps {
  onActionSelect: (action: string) => void;
}

export function ActionButtons({ onActionSelect }: ActionButtonsProps) {
  return (
    <div className="flex justify-evenly gap-2 px-2 py-2">
      {actions.map(({ key, label }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className={`
            border-gray-700 
            bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-100
          `}
          onClick={() => onActionSelect(key)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
} 