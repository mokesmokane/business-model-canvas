import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins } from "lucide-react"
import { CanvasSection } from "./CanvasSection"
import { useEffect } from "react"
import { useCanvas } from "@/contexts/CanvasContext"
import { useCanvasTheme } from '@/contexts/CanvasThemeContext'

interface CanvasContentProps {
  onExpandSidebar: () => void
}

export function CanvasContent({ onExpandSidebar }: CanvasContentProps) {
  const { canvasTheme } = useCanvasTheme()
  const { currentCanvas, formData, updateField, updateSection } = useCanvas();

  useEffect(() => {
    console.log('Canvas updated:', formData);
  }, [formData]);

  return (
    <div className={`flex flex-col flex-1 p-4 space-y-4 overflow-auto ${
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div className={`grid grid-cols-5 gap-4 flex-[2] ${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <CanvasSection
          key={`keyPartners-${formData.keyPartners?.length}`}
          title="Key Partners"
          sectionKey="keyPartners"
          icon={Building2}
          items={formData.keyPartners}
          onChange={(value: string[]) => updateSection('keyPartners', value)}
          placeholder={`Who are our Key Partners?
Who are our key suppliers?
Which Key Resources are we acquiring from partners?
Which Key Activities do partners perform?`}
        />
        <div className="flex flex-col space-y-4 flex-1">
          <CanvasSection
            key={`keyActivities-${formData.keyActivities?.length}`}
            title="Key Activities"
            sectionKey="keyActivities"
            icon={Workflow}
            items={formData.keyActivities}
            onChange={(value: string[]) => updateSection('keyActivities', value)}
            placeholder={`What Key Activities do our Value Propositions require?
Our Distribution Channels?
Customer Relationships?
Revenue Streams?`}
            className="flex-1"
          />
          <CanvasSection
            key={`keyResources-${formData.keyResources?.length}`}
            title="Key Resources"
            sectionKey="keyResources"
            icon={Receipt}
            items={formData.keyResources} 
            onChange={(value: string[]) => updateSection('keyResources', value)}
            placeholder={`What Key Resources do our Value Propositions require?
Our Distribution Channels? Customer Relationships?
Revenue Streams?`}
            className="flex-1"
          />
        </div>
        <CanvasSection
          key={`valuePropositions-${formData.valuePropositions?.length}`}
          title="Value Propositions"
          sectionKey="valuePropositions"
          icon={Gift}
          items={formData.valuePropositions}
          onChange={(value: string[]) => updateSection('valuePropositions', value)}
          placeholder={`What value do we deliver to the customer?
Which one of our customer's problems are we helping to solve?
What bundles of products and services are we offering to each Customer Segment?
Which customer needs are we satisfying?`}
        />
        <div className="flex flex-col space-y-4 flex-1">
          <CanvasSection
            key={`customerRelationships-${formData.customerRelationships?.length}`}
            title="Customer Relationships"
            sectionKey="customerRelationships"
            icon={Heart}
            items={formData.customerRelationships}
            onChange={(value: string[]) => updateSection('customerRelationships', value)}
            placeholder={`What type of relationship does each of our Customer Segments expect us to establish and maintain with them?
Which ones have we established?
How are they integrated with the rest of our business model?
How costly are they?`}
            className="flex-1"
          />
          <CanvasSection
            key={`channels-${formData.channels?.length}`}
            title="Channels"
            sectionKey="channels"
            icon={Truck}
            items={formData.channels}
            onChange={(value: string[]) => updateSection('channels', value)}
            placeholder={`Through which Channels do our Customer Segments want to be reached?
How are we reaching them now?
How are our Channels integrated?
Which ones work best?
Which ones are most cost-efficient?
How are we integrating them with customer routines?`}
            className="flex-1"
          />
        </div>
        <CanvasSection
          key={`customerSegments-${formData.customerSegments?.length}`}
          title="Customer Segments"
          sectionKey="customerSegments"
          icon={Users2}
          items={formData.customerSegments}
          onChange={(value: string[]) => updateSection('customerSegments', value)}
          placeholder={`For whom are we creating value?
Who are our most important customers?`}
        />
      </div>
      <div className={`grid grid-cols-2 gap-4 flex-1 ${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <CanvasSection
          key={`costStructure-${formData.costStructure?.length}`}
          title="Cost Structure"
          sectionKey="costStructure"
          icon={Users}
          items={formData.costStructure}
          onChange={(value: string[]) => updateSection('costStructure', value)}
          placeholder={`What are the most important costs inherent in our business model?
Which Key Resources are most expensive?
Which Key Activities are most expensive?`}
        />
        <CanvasSection
          key={`revenueStreams-${formData.revenueStreams?.length}`}
          title="Revenue Streams"
          sectionKey="revenueStreams"
          icon={Coins}
          items={formData.revenueStreams}
          onChange={(value: string[]) => updateSection('revenueStreams', value)}
          placeholder={`For what value are our customers really willing to pay?
For what do they currently pay?
How are they currently paying?
How would they prefer to pay?
How much does each Revenue Stream contribute to overall revenues?`}
        />
      </div>
    </div>
  )
} 