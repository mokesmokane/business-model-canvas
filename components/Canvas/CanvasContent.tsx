import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins } from "lucide-react"
import { CanvasSection } from "./CanvasSection"
import { useEffect } from "react"
import { useCanvas } from "@/contexts/CanvasContext"
import { Section } from "@/types/canvas"

interface CanvasContentProps {
  onExpandSidebar: () => void
}

export function CanvasContent({ onExpandSidebar }: CanvasContentProps) {
  const { formData, canvasTheme, updateSection } = useCanvas();

  useEffect(() => {
  }, [formData]);

  // Helper function to safely get section data
  const getSection = (key: string): Section => {
    if (!formData?.sections) return { name: '', items: [], qAndAs: [] };
    return formData.sections.get(key) || { name: '', items: [], qAndAs: [] };
  };

  return (
    <div className={`flex flex-col flex-1 p-4 space-y-4 overflow-auto ${
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div className={`grid grid-cols-5 gap-4 flex-[2] ${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <CanvasSection
          key={`keyPartners-${formData.sections?.get('keyPartners')?.items?.length}`}
          title="Key Partners"
          sectionKey="keyPartners"
          icon={Building2}
          section={getSection('keyPartners')}
          onChange={(value: string[]) => updateSection('keyPartners', value)}
          placeholder={`Who are our Key Partners?
Who are our key suppliers?
Which Key Resources are we acquiring from partners?
Which Key Activities do partners perform?`}
        />
        <div className="flex flex-col space-y-4 flex-1">
          <CanvasSection
            key={`keyActivities-${formData.sections?.get('keyActivities')?.items?.length}`}
            title="Key Activities"
            sectionKey="keyActivities"
            icon={Workflow}
            section={getSection('keyActivities')}
            onChange={(value: string[]) => updateSection('keyActivities', value)}
            placeholder={`What Key Activities do our Value Propositions require?
Our Distribution Channels?
Customer Relationships?
Revenue Streams?`}
            className="flex-1"
          />
          <CanvasSection
            key={`keyResources-${formData.sections?.get('keyResources')?.items?.length}`}
            title="Key Resources"
            sectionKey="keyResources"
            icon={Receipt}
            section={getSection('keyResources')}
            onChange={(value: string[]) => updateSection('keyResources', value)}
            placeholder={`What Key Resources do our Value Propositions require?
Our Distribution Channels? Customer Relationships?
Revenue Streams?`}
            className="flex-1"
          />
        </div>
        <CanvasSection
          key={`valuePropositions-${formData.sections?.get('valuePropositions')?.items?.length}`}
          title="Value Propositions"
          sectionKey="valuePropositions"
          icon={Gift}
          section={getSection('valuePropositions')}
          onChange={(value: string[]) => updateSection('valuePropositions', value)}
          placeholder={`What value do we deliver to the customer?
Which one of our customer's problems are we helping to solve?
What bundles of products and services are we offering to each Customer Segment?
Which customer needs are we satisfying?`}
        />
        <div className="flex flex-col space-y-4 flex-1">
          <CanvasSection
            key={`customerRelationships-${formData.sections?.get('customerRelationships')?.items?.length}`}
            title="Customer Relationships"
            sectionKey="customerRelationships"
            icon={Heart}
            section={getSection('customerRelationships')}
            onChange={(value: string[]) => updateSection('customerRelationships', value)}
            placeholder={`What type of relationship does each of our Customer Segments expect us to establish and maintain with them?
Which ones have we established?
How are they integrated with the rest of our business model?
How costly are they?`}
            className="flex-1"
          />
          <CanvasSection
            key={`channels-${formData.sections?.get('channels')?.items?.length}`}
            title="Channels"
            sectionKey="channels"
            icon={Truck}
            section={getSection('channels')}
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
          key={`customerSegments-${formData.sections?.get('customerSegments')?.items?.length}`}
          title="Customer Segments"
          sectionKey="customerSegments"
          icon={Users2}
          section={getSection('customerSegments')}
          onChange={(value: string[]) => updateSection('customerSegments', value)}
          placeholder={`For whom are we creating value?
Who are our most important customers?`}
        />
      </div>
      <div className={`grid grid-cols-2 gap-4 flex-1 ${
        canvasTheme === 'light' ? 'bg-white' : 'bg-gray-950'
      }`}>
        <CanvasSection
          key={`costStructure-${formData.sections?.get('costStructure')?.items?.length}`}
          title="Cost Structure"
          sectionKey="costStructure"
          icon={Users}
          section={getSection('costStructure')}
          onChange={(value: string[]) => updateSection('costStructure', value)}
          placeholder={`What are the most important costs inherent in our business model?
Which Key Resources are most expensive?
Which Key Activities are most expensive?`}
        />
        <CanvasSection
          key={`revenueStreams-${formData.sections?.get('revenueStreams')?.items?.length}`}
          title="Revenue Streams"
          sectionKey="revenueStreams"
          icon={Coins}
          section={getSection('revenueStreams')}
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