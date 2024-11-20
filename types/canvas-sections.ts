import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins, LucideIcon, Factory, BellElectric, Bolt, Zap, Blend, Handshake, HandCoins,  } from "lucide-react"
import { Canvas, Section } from "./canvas"

export interface CanvasSection {
  name: string
  icon: string
  placeholder: string
  gridIndex: number
}

function compareAreas(areas1: string[], areas2: string[]): boolean {
    return areas1.length === areas2.length && areas1.every((area, index) => area === areas2[index]);
}

export function compareLayouts(layout1: CanvasLayout | null, layout2: CanvasLayout | null): boolean {
    if (!layout1 || !layout2) return false;
    return layout1.gridTemplate.columns === layout2.gridTemplate.columns &&
           layout1.gridTemplate.rows === layout2.gridTemplate.rows &&
           compareAreas(layout1.areas, layout2.areas);
}

export interface CanvasLayout {
    gridTemplate: {
        columns: string
        rows: string
    }
    areas: string[]
}

export interface CanvasLayoutDetails {
    id: string
    sectionCount: number
    name: string
    layout: CanvasLayout
    description: string
}

export interface CanvasType {
  id: string
  name: string
  icon: string
  description: string
  defaultLayout?: CanvasLayoutDetails
  sections: CanvasSection[]
}

export interface CanvasLayoutSuggestion extends CanvasLayout {
  rationale: string
}

export interface CanvasSectionSuggestion extends CanvasSection {
  rationale: string
}

export interface CanvasTypeSuggestion extends CanvasType {
  rationale: string
}

export const BUSINESS_MODEL_LAYOUT: CanvasLayoutDetails = {
    id: "business-model",
    sectionCount: 9,
    name: "Business Model Canvas",
    layout: {
      gridTemplate: {
        columns: "4fr 4fr 2fr 2fr 4fr 4fr",
        rows: "auto auto auto"
      },
      areas: [
        "1 / 1 / 3 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 3 / 5",
      "1 / 5 / 2 / 5",
      "1 / 6 / 3 / 6",
      "2 / 2 / 3 / 3",
      "2 / 5 / 3 / 5",
      "3 / 1 / 4 / 4",
        "3 / 4 / 4 / 7"
      ]
    },
    description: "A strategic management template for developing new or documenting existing business models"
  }


export const BUSINESS_MODEL_CANVAS: CanvasType =  {
    id: "business-model",
    icon: Building2.displayName!,
    name: "Business Model Canvas",
    description: "A strategic management template for developing new or documenting existing business models",
    defaultLayout: BUSINESS_MODEL_LAYOUT,
    sections: [
      {
        name: 'Key Partners',
        gridIndex: 0,
        icon: Blend.displayName!,
        placeholder: `Who are our Key Partners?
Who are our key suppliers?
Which Key Resources are we acquiring from partners?
Which Key Activities do partners perform?`
      },
      {
        name: 'Key Activities',
        gridIndex: 1,
        icon: Zap.displayName!,
        placeholder: `What Key Activities do our Value Propositions require?
Our Distribution Channels?
Customer Relationships?
Revenue Streams?`
      },
      {
        name: 'Key Resources',
        gridIndex: 5,
        icon: Factory.displayName!,
        placeholder: `What Key Resources do our Value Propositions require?
Our Distribution Channels? Customer Relationships?
Revenue Streams?`
      },
      {
        name: 'Value Propositions',
        gridIndex: 2,
        icon: Gift.displayName!,
        placeholder: `What value do we deliver to the customer?
Which one of our customer's problems are we helping to solve?
What bundles of products and services are we offering to each Customer Segment?
Which customer needs are we satisfying?`
      },
      {
        name: 'Customer Relationships',
        gridIndex: 3,
        icon: Heart.displayName!,
        placeholder: `What type of relationship does each of our Customer Segments expect us to establish and maintain with them?
Which ones have we established?
How are they integrated with the rest of our business model?
How costly are they?`
      },
      {
        name: 'Channels',
        gridIndex: 6,
        icon: Truck.displayName!,
        placeholder: `Through which Channels do our Customer Segments want to be reached?
How are we reaching them now?
How are our Channels integrated?
Which ones work best?
Which ones are most cost-efficient?
How are we integrating them with customer routines?`
      },
      {
        name: 'Customer Segments',
        gridIndex: 4,
        icon: Users2.displayName!,
        placeholder: `For whom are we creating value?
Who are our most important customers?`
      },
      {
        name: 'Cost Structure',
        gridIndex: 7,
        icon: Receipt.displayName!,
        placeholder: `What are the most important costs inherent in our business model?
Which Key Resources are most expensive?
Which Key Activities are most expensive?`
      },
      {
        name: 'Revenue Streams',
        gridIndex: 8,
        icon: HandCoins.displayName!,
        placeholder: `For what value are our customers really willing to pay?
For what do they currently pay?
How are they currently paying?
How would they prefer to pay?
How much does each Revenue Stream contribute to overall revenues?`
      }
    ]
  }

export const getInitialCanvasState = (canvasType: CanvasType, canvasLayout?: CanvasLayout): Canvas => ({
    id: '',
    name: '',
    description: '',
    designedFor: '',
    designedBy: '',
    date: '',
    version: '',
    sections: new Map(
      canvasType.sections.map(section => [
        section.name,
        { name: section.name, items: [], qAndAs: [], gridIndex: section.gridIndex } as Section
      ])
    ),
    userId: '',
    createdAt: undefined,
    updatedAt: undefined,
    theme: 'light',
    canvasType: canvasType,
    canvasLayout: canvasLayout || canvasType.defaultLayout?.layout || BUSINESS_MODEL_LAYOUT.layout
  });

// // Updated helper function to get initial sections map for a specific canvas type
// export const getInitialSections = (canvasType: string): Map<string, Section> => {
//   const sectionsMap = new Map<string, Section>()
//   const canvas = CANVAS_TYPES[canvasType]
//   if (!canvas) throw new Error(`Canvas type ${canvasType} not found`)
  
//   canvas.sections.forEach(section => {
//     sectionsMap.set(section.name, {
//       name: section.name,
//       items: [],
//       qAndAs: [],
//       gridIndex: section.gridIndex
//     })
//   })
//   return sectionsMap
// } 