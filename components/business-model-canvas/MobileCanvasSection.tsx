import { LucideIcon } from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";
import { Section } from "@/types/canvas";
import { Card } from "@/components/ui/card";
import { DynamicInput } from "../Canvas/DynamicInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionItem from "../Canvas/SectionItem";

interface MobileCanvasSectionProps {
  title: string;
  icon: LucideIcon;
  sectionKey: string;
  section: Section;
}

export function MobileCanvasSection({ 
  title, 
  icon: Icon, 
  sectionKey, 
  section 
}: MobileCanvasSectionProps) {
  const { updateSection, canvasTheme } = useCanvas();
  const itemsArray = Array.isArray(section.items) ? section.items : [];

  const handleAddOrUpdateItem = (content: string) => {
    const newItems = [...itemsArray, content];
    updateSection(sectionKey, newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...itemsArray];
    newItems.splice(index, 1);
    updateSection(sectionKey, newItems);
  };

  return (
    <Card 
      canvasTheme={canvasTheme}
      className={`mx-4 h-[calc(100vh-200px)] flex flex-col ${
        canvasTheme === 'light' 
          ? 'bg-white border-gray-200' 
          : 'bg-gray-950 border-gray-800'
      }`}
    >
      <div className={`p-4 flex items-center gap-2 border-b ${
        canvasTheme === 'light' 
          ? 'border-gray-200 text-gray-900' 
          : 'border-gray-800 text-gray-100'
      }`}>
        <Icon className={`h-5 w-5 ${
          canvasTheme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`} />
        <h2 className="font-semibold">{title}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        {itemsArray.length === 0 ? (
          <p className={`text-sm ${
            canvasTheme === 'light' 
              ? 'text-gray-500' 
              : 'text-gray-400'
          }`}>
            Add your first item for {title}
          </p>
        ) : (
          itemsArray.map((item, index) => (
            <SectionItem
              key={index}
              item={item}
              onDelete={() => handleDeleteItem(index)}
              isEditing={false}
              onEditStart={() => {}}
              onEditEnd={() => {}}
            />
          ))
        )}
      </ScrollArea>

      <div className={`p-4 border-t ${
        canvasTheme === 'light' 
          ? 'border-gray-200' 
          : 'border-gray-800'
      }`}>
        <DynamicInput
          placeholder={`Add to ${title}`}
          onSubmit={handleAddOrUpdateItem}
          initialValue=""
          isEditing={false}
        />
      </div>
    </Card>
  );
} 