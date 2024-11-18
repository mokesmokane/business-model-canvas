import { Building2, Users, Workflow, Gift, Heart, Users2, Truck, Receipt, Coins, LucideIcon } from "lucide-react"
import { Canvas, Section } from "./canvas"

export interface CanvasSection {
  key: string
  name: string
  icon: LucideIcon
  placeholder: string
}

export interface CanvasLayoutDetails {
    sectionCount: number
    key: string
    name: string
    gridTemplate: {
        columns: string
        rows: string
    }
    areas?: string[]
}

export interface CanvasType {
  name: string
  key: string
  icon: LucideIcon
  description: string
  layout: CanvasLayoutDetails
  sections: CanvasSection[]
}

export const CANVAS_LAYOUTS: Record<string, CanvasLayoutDetails> = {
  BUSINESS_MODEL: {
    sectionCount: 9,
    key: "BUSINESS_MODEL",
    name: "Business Model Canvas",
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
  LEAN_CANVAS: {
    sectionCount: 9,
    key: "LEAN_CANVAS",
    name: "Lean Canvas",
    gridTemplate: {
      columns: "3fr 3fr 3fr",
      rows: "auto auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "3 / 1 / 4 / 2",
      "3 / 2 / 4 / 3",
      "3 / 3 / 4 / 4"
    ]
  },
  CUSTOMER_JOURNEY: {
    sectionCount: 9,
    key: "CUSTOMER_JOURNEY",
    name: "Customer Journey Map",
    gridTemplate: {
      columns: "2fr 2fr 2fr 2fr",
      rows: "auto auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "2 / 4 / 3 / 5",
      "3 / 1 / 4 / 5"
    ]
  },THREE_SECTIONS_LAYOUT_1: {
    sectionCount: 3,
    key: "THREE_SECTIONS_LAYOUT_1",
    name: "Three Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr 1fr",
      rows: "auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4"
    ]
  },
  THREE_SECTIONS_LAYOUT_2: {
    sectionCount: 3,
    key: "THREE_SECTIONS_LAYOUT_2",
    name: "Three Sections Layout 2",
    gridTemplate: {
      columns: "2fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "2 / 1 / 3 / 3"
    ]
  },
  THREE_SECTIONS_LAYOUT_3: {
    sectionCount: 3,
    key: "THREE_SECTIONS_LAYOUT_3",
    name: "Three Sections Layout 3",
    gridTemplate: {
      columns: "1fr 2fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "2 / 1 / 3 / 3"
    ]
  },

  // Layouts for section count 4
  FOUR_SECTIONS_LAYOUT_1: {
    sectionCount: 4,
    key: "FOUR_SECTIONS_LAYOUT_1",
    name: "Four Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3"
    ]
  },
  FOUR_SECTIONS_LAYOUT_2: {
    key: "FOUR_SECTIONS_LAYOUT_2",
    sectionCount: 4,
    name: "Four Sections Layout 2",
    gridTemplate: {
      columns: "1fr 1fr 1fr 1fr",
      rows: "auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5"
    ]
  },
  FOUR_SECTIONS_LAYOUT_3: {
    key: "FOUR_SECTIONS_LAYOUT_3",
    sectionCount: 4,
    name: "Four Sections Layout 3",
    gridTemplate: {
      columns: "2fr 2fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3"
    ]
  },

  // Layouts for section count 5
  FIVE_SECTIONS_LAYOUT_1: {
    key: "FIVE_SECTIONS_LAYOUT_1",
    sectionCount: 5,
    name: "Five Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3"
    ]
  },
  FIVE_SECTIONS_LAYOUT_2: {
    key: "FIVE_SECTIONS_LAYOUT_2",
    sectionCount: 5,
    name: "Five Sections Layout 2",
    gridTemplate: {
      columns: "2fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3"
    ]
  },
  FIVE_SECTIONS_LAYOUT_3: {
    key: "FIVE_SECTIONS_LAYOUT_3",
    sectionCount: 5,
    name: "Five Sections Layout 3",
    gridTemplate: {
      columns: "1fr 2fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3"
    ]
  },

  // Layouts for section count 6
  SIX_SECTIONS_LAYOUT_1: {
    key: "SIX_SECTIONS_LAYOUT_1",
    sectionCount: 6,
    name: "Six Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4"
    ]
  },
  SIX_SECTIONS_LAYOUT_2: {
    key: "SIX_SECTIONS_LAYOUT_2",
    sectionCount: 6,
    name: "Six Sections Layout 2",
    gridTemplate: {
      columns: "2fr 1fr 1fr 2fr",
      rows: "auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 4 / 3 / 5"
    ]
  },
  SIX_SECTIONS_LAYOUT_3: {
    key: "SIX_SECTIONS_LAYOUT_3",
    sectionCount: 6,
    name: "Six Sections Layout 3",
    gridTemplate: {
      columns: "1fr 2fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4"
    ]
  },

  // Layouts for section count 7
  SEVEN_SECTIONS_LAYOUT_1: {
    key: "SEVEN_SECTIONS_LAYOUT_1",
    sectionCount: 7,
    name: "Seven Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4"
    ]
  },
  SEVEN_SECTIONS_LAYOUT_2: {
    key: "SEVEN_SECTIONS_LAYOUT_2",
    sectionCount: 7,
    name: "Seven Sections Layout 2",
    gridTemplate: {
      columns: "2fr 1fr 1fr 2fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 4 / 3 / 5"
    ]
  },
  SEVEN_SECTIONS_LAYOUT_3: {
    key: "SEVEN_SECTIONS_LAYOUT_3",
    sectionCount: 7,
    name: "Seven Sections Layout 3",
    gridTemplate: {
      columns: "1fr 2fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "2 / 4 / 3 / 5"
    ]
  },

  // Layouts for section count 8
  EIGHT_SECTIONS_LAYOUT_1: {
    key: "EIGHT_SECTIONS_LAYOUT_1",
    sectionCount: 8,
    name: "Eight Sections Layout 1",
    gridTemplate: {
      columns: "1fr 1fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "2 / 4 / 3 / 5"
    ]
  },
  EIGHT_SECTIONS_LAYOUT_2: {
    key: "EIGHT_SECTIONS_LAYOUT_2",
    sectionCount: 8,
    name: "Eight Sections Layout 2",
    gridTemplate: {
      columns: "2fr 1fr 1fr 2fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "2 / 4 / 3 / 5"
    ]
  },
  EIGHT_SECTIONS_LAYOUT_3: {
    key: "EIGHT_SECTIONS_LAYOUT_3",
    sectionCount: 8,
    name: "Eight Sections Layout 3",
    gridTemplate: {
      columns: "1fr 2fr 1fr 1fr",
      rows: "auto auto"
    },
    areas: [
      "1 / 1 / 2 / 2",
      "1 / 2 / 2 / 3",
      "1 / 3 / 2 / 4",
      "1 / 4 / 2 / 5",
      "2 / 1 / 3 / 2",
      "2 / 2 / 3 / 3",
      "2 / 3 / 3 / 4",
      "2 / 4 / 3 / 5"
    ]
  }
}

export const CANVAS_TYPES: Record<string, CanvasType> = {
  businessModel: {
    icon: Building2,
    name: "Business Model Canvas",
    key: "businessModel",
    description: "A strategic management template for developing new or documenting existing business models",
    layout: CANVAS_LAYOUTS.BUSINESS_MODEL,
    sections: [
      {
        key: 'keyPartners',
        name: 'Key Partners',
        icon: Building2,
        placeholder: `Who are our Key Partners?
Who are our key suppliers?
Which Key Resources are we acquiring from partners?
Which Key Activities do partners perform?`
      },
      {
        key: 'keyActivities',
        name: 'Key Activities',
        icon: Workflow,
        placeholder: `What Key Activities do our Value Propositions require?
Our Distribution Channels?
Customer Relationships?
Revenue Streams?`
      },
      {
        key: 'keyResources',
        name: 'Key Resources',
        icon: Receipt,
        placeholder: `What Key Resources do our Value Propositions require?
Our Distribution Channels? Customer Relationships?
Revenue Streams?`
      },
      {
        key: 'valuePropositions',
        name: 'Value Propositions',
        icon: Gift,
        placeholder: `What value do we deliver to the customer?
Which one of our customer's problems are we helping to solve?
What bundles of products and services are we offering to each Customer Segment?
Which customer needs are we satisfying?`
      },
      {
        key: 'customerRelationships',
        name: 'Customer Relationships',
        icon: Heart,
        placeholder: `What type of relationship does each of our Customer Segments expect us to establish and maintain with them?
Which ones have we established?
How are they integrated with the rest of our business model?
How costly are they?`
      },
      {
        key: 'channels',
        name: 'Channels',
        icon: Truck,
        placeholder: `Through which Channels do our Customer Segments want to be reached?
How are we reaching them now?
How are our Channels integrated?
Which ones work best?
Which ones are most cost-efficient?
How are we integrating them with customer routines?`
      },
      {
        key: 'customerSegments',
        name: 'Customer Segments',
        icon: Users2,
        placeholder: `For whom are we creating value?
Who are our most important customers?`
      },
      {
        key: 'costStructure',
        name: 'Cost Structure',
        icon: Users,
        placeholder: `What are the most important costs inherent in our business model?
Which Key Resources are most expensive?
Which Key Activities are most expensive?`
      },
      {
        key: 'revenueStreams',
        name: 'Revenue Streams',
        icon: Coins,
        placeholder: `For what value are our customers really willing to pay?
For what do they currently pay?
How are they currently paying?
How would they prefer to pay?
How much does each Revenue Stream contribute to overall revenues?`
      }
    ]
  },
  lean: {
    icon: Building2,
    name: "Lean Canvas",
    key: "lean",
    description: "Adaptation of the Business Model Canvas for lean startups",
    layout: CANVAS_LAYOUTS.BUSINESS_MODEL,
    sections: [
      {
        key: 'problem',
        name: 'Problem',
        icon: Users,
        placeholder: 'List your top 3 problems'
      },
      {
        key: 'solution',
        name: 'Solution',
        icon: Workflow,
        placeholder: 'Outline a possible solution for each problem'
      },
      {
        key: 'uniqueValueProposition',
        name: 'Unique Value Proposition',
        icon: Gift,
        placeholder: 'Single, clear, compelling message that states why you are different and worth paying attention to'
      },
      {
        key: 'unfairAdvantage',
        name: 'Unfair Advantage',
        icon: Building2,
        placeholder: 'Something that cannot be easily copied or bought'
      },
      {
        key: 'customerSegments',
        name: 'Customer Segments',
        icon: Users2,
        placeholder: 'Target customers and users'
      },
      {
        key: 'keyMetrics',
        name: 'Key Metrics',
        icon: Receipt,
        placeholder: 'Key numbers that tell you how your business is doing'
      },
      {
        key: 'channels',
        name: 'Channels',
        icon: Truck,
        placeholder: 'Path to customers'
      },
      {
        key: 'costStructure',
        name: 'Cost Structure',
        icon: Coins,
        placeholder: 'Fixed and variable costs'
      },
      {
        key: 'revenueStreams',
        name: 'Revenue Streams',
        icon: Coins,
        placeholder: 'Revenue model, lifetime value, revenue, gross margin'
      }
    ]
  },
  threeSectionCanvas: {
    icon: Building2,
    name: "Three Section Canvas",
    key: "threeSectionCanvas",
    description: "A canvas with three sections for specific use cases",
    layout: CANVAS_LAYOUTS.THREE_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      }
    ]
  },
  fourSectionCanvas: {
    icon: Building2,
    name: "Four Section Canvas",
    key: "fourSectionCanvas",
    description: "A canvas with four sections for specific use cases",
    layout: CANVAS_LAYOUTS.FOUR_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      },
      {
        key: 'sectionFour',
        name: 'Section Four',
        icon: Heart,
        placeholder: 'Description or questions for Section Four'
      }
    ]
  },
  fiveSectionCanvas: {
    icon: Building2,
    name: "Five Section Canvas",
    key: "fiveSectionCanvas",
    description: "A canvas with five sections for specific use cases",
    layout: CANVAS_LAYOUTS.FIVE_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      },
      {
        key: 'sectionFour',
        name: 'Section Four',
        icon: Heart,
        placeholder: 'Description or questions for Section Four'
      },
      {
        key: 'sectionFive',
        name: 'Section Five',
        icon: Truck,
        placeholder: 'Description or questions for Section Five'
      }
    ]
  },
  sixSectionCanvas: {
    icon: Building2,
    name: "Six Section Canvas",
    key: "sixSectionCanvas",
    description: "A canvas with six sections for specific use cases",
    layout: CANVAS_LAYOUTS.SIX_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      },
      {
        key: 'sectionFour',
        name: 'Section Four',
        icon: Heart,
        placeholder: 'Description or questions for Section Four'
      },
      {
        key: 'sectionFive',
        name: 'Section Five',
        icon: Truck,
        placeholder: 'Description or questions for Section Five'
      },
      {
        key: 'sectionSix',
        name: 'Section Six',
        icon: Receipt,
        placeholder: 'Description or questions for Section Six'
      }
    ]
  },
  sevenSectionCanvas: {
    icon: Building2,
    name: "Seven Section Canvas",
    key: "sevenSectionCanvas",
    description: "A canvas with seven sections for specific use cases",
    layout: CANVAS_LAYOUTS.SEVEN_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      },
      {
        key: 'sectionFour',
        name: 'Section Four',
        icon: Heart,
        placeholder: 'Description or questions for Section Four'
      },
      {
        key: 'sectionFive',
        name: 'Section Five',
        icon: Truck,
        placeholder: 'Description or questions for Section Five'
      },
      {
        key: 'sectionSix',
        name: 'Section Six',
        icon: Receipt,
        placeholder: 'Description or questions for Section Six'
      },
      {
        key: 'sectionSeven',
        name: 'Section Seven',
        icon: Coins,
        placeholder: 'Description or questions for Section Seven'
      }
    ]
  },
  eightSectionCanvas: {
    icon: Building2,
    name: "Eight Section Canvas",
    key: "eightSectionCanvas",
    description: "A canvas with eight sections for specific use cases",
    layout: CANVAS_LAYOUTS.EIGHT_SECTIONS_LAYOUT_1,
    sections: [
      {
        key: 'sectionOne',
        name: 'Section One',
        icon: Users,
        placeholder: 'Description or questions for Section One'
      },
      {
        key: 'sectionTwo',
        name: 'Section Two',
        icon: Workflow,
        placeholder: 'Description or questions for Section Two'
      },
      {
        key: 'sectionThree',
        name: 'Section Three',
        icon: Gift,
        placeholder: 'Description or questions for Section Three'
      },
      {
        key: 'sectionFour',
        name: 'Section Four',
        icon: Heart,
        placeholder: 'Description or questions for Section Four'
      },
      {
        key: 'sectionFive',
        name: 'Section Five',
        icon: Truck,
        placeholder: 'Description or questions for Section Five'
      },
      {
        key: 'sectionSix',
        name: 'Section Six',
        icon: Receipt,
        placeholder: 'Description or questions for Section Six'
      },
      {
        key: 'sectionSeven',
        name: 'Section Seven',
        icon: Coins,
        placeholder: 'Description or questions for Section Seven'
      },
      {
        key: 'sectionEight',
        name: 'Section Eight',
        icon: Users2,
        placeholder: 'Description or questions for Section Eight'
      }
    ]
  }
}

export const getInitialCanvasState = (canvasType: CanvasType, canvasLayout: CanvasLayoutDetails): Canvas => ({
    id: '',
    name: '',
    description: '',
    designedFor: '',
    designedBy: '',
    date: '',
    version: '',
    sections: new Map(
      canvasType.sections.map(section => [
        section.key,
        { name: section.name, items: [], qAndAs: [] } as Section
      ])
    ),
    userId: '',
    createdAt: undefined,
    updatedAt: undefined,
    theme: 'light',
    canvasTypeKey: canvasType.key,
    canvasLayoutKey: canvasLayout.key
  });

// Updated helper function to get initial sections map for a specific canvas type
export const getInitialSections = (canvasType: string): Map<string, Section> => {
  const sectionsMap = new Map<string, Section>()
  const canvas = CANVAS_TYPES[canvasType]
  if (!canvas) throw new Error(`Canvas type ${canvasType} not found`)
  
  canvas.sections.forEach(section => {
    sectionsMap.set(section.key, {
      name: section.name,
      items: [],
      qAndAs: []
    })
  })
  return sectionsMap
} 