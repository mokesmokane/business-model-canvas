import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCanvas } from '@/contexts/CanvasContext';
import DynamicIcon from '../Util/DynamicIcon';


interface SectionButtonsProps {
  activeSection: string | null;
  onSectionSelect: (section: string | null) => void;
}

export function SectionButtons({ activeSection, onSectionSelect }: SectionButtonsProps) {
  let {formData} = useCanvas();
// Type the Map entries and conversion
  const sections = Array.from(
    formData.canvasType.sections.entries()
  ).map(([i,section]) => ({
    icon: section.icon,
    name: section.name,
    key: section.name
  }));
  return (
    <div className="flex justify-between px-4 py-2">
      {sections.map(({ icon: Icon, name, key }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${
                activeSection === key 
                  ? 'dark:bg-gray-800 dark:text-gray-100 bg-gray-100 text-gray-900' 
                  : 'text-gray-400'
              }`}
              onClick={() => {
                if (activeSection !== key) {
                  onSectionSelect(key)
                } else {
                  onSectionSelect(null)
                }
              }}
            >
              <DynamicIcon name={Icon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800"
          >
            {name}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
} 