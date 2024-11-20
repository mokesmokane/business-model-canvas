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

export function compareLayouts(layout1: CanvasLayout, layout2: CanvasLayout): boolean {
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
    sectionCount: number
    name: string
    layout: CanvasLayout
}

export interface CanvasType {
  name: string
  icon: string
  description: string
  defaultLayout: CanvasLayoutDetails
  sections: CanvasSection[]
}

export const CANVAS_LAYOUTS: Record<string, CanvasLayoutDetails> = {
  BUSINESS_MODEL: {
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
    }
  },
  LEAN_CANVAS: {
    sectionCount: 9,
    name: "Lean Canvas",
    layout: {
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
    }
  },
  CUSTOMER_JOURNEY: {
    sectionCount: 9,
    name: "Customer Journey Map",
    layout: {
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
    }
  },
  THREE_SECTIONS_LAYOUT_1: {
    sectionCount: 3,
    name: "Three Sections Layout 1",
    layout: {
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
},
  THREE_SECTIONS_LAYOUT_2: {
    sectionCount: 3,
    name: "Three Sections Layout 2",
    layout: {
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
},
  THREE_SECTIONS_LAYOUT_3: {
    sectionCount: 3,
    name: "Three Sections Layout 3",
    layout: {
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
},
  FOUR_SECTIONS_LAYOUT_1: {
    sectionCount: 4,
    name: "Four Sections Layout 1",
    layout: {
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
},
  FOUR_SECTIONS_LAYOUT_2: {
    sectionCount: 4,
    name: "Four Sections Layout 2",
    layout: {
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
},
  FOUR_SECTIONS_LAYOUT_3: {
    sectionCount: 4,
    name: "Four Sections Layout 3",
    layout: {
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
},

  FIVE_SECTIONS_LAYOUT_1: {
    sectionCount: 5,
    name: "Five Sections Layout 1",
    layout: {
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
},
  FIVE_SECTIONS_LAYOUT_2: {
    sectionCount: 5,
    name: "Five Sections Layout 2",
    layout: {
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
},
  FIVE_SECTIONS_LAYOUT_3: {
    sectionCount: 5,
    name: "Five Sections Layout 3",
    layout: {
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
  },
  // Layouts for section count 6
  SIX_SECTIONS_LAYOUT_1: {
    sectionCount: 6,
    name: "Six Sections Layout 1",
    layout: {
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
  },
  SIX_SECTIONS_LAYOUT_2: {
    sectionCount: 6,
    name: "Six Sections Layout 2",
    layout: {
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
},
  SIX_SECTIONS_LAYOUT_3: {
    sectionCount: 6,
    name: "Six Sections Layout 3",
    layout: {
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
  },
  // Layouts for section count 7
  SEVEN_SECTIONS_LAYOUT_1: {
    sectionCount: 7,
    name: "Seven Sections Layout 1",
    layout: {
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
},
  SEVEN_SECTIONS_LAYOUT_2: {
    sectionCount: 7,
    name: "Seven Sections Layout 2",
    layout: {
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
},
  SEVEN_SECTIONS_LAYOUT_3: {
    sectionCount: 7,
    name: "Seven Sections Layout 3",
    layout: {
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
  },
  // Layouts for section count 8
  EIGHT_SECTIONS_LAYOUT_1: {
    sectionCount: 8,
    name: "Eight Sections Layout 1",
    layout: {
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
},
  EIGHT_SECTIONS_LAYOUT_2: {
    sectionCount: 8,
    name: "Eight Sections Layout 2",
    layout: {
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
},
  EIGHT_SECTIONS_LAYOUT_3: {
    sectionCount: 8,
    name: "Eight Sections Layout 3",
    layout: {
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
}   


export const CANVAS_TYPES: Record<string, CanvasType> = {
  businessModel: {
    icon: Building2.displayName!,
    name: "Business Model Canvas",
    description: "A strategic management template for developing new or documenting existing business models",
    defaultLayout: CANVAS_LAYOUTS.BUSINESS_MODEL,
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
  },
  lean: {
    icon: Building2.displayName!,
    name: "Lean Canvas",
    description: "Adaptation of the Business Model Canvas for lean startups",
    defaultLayout: CANVAS_LAYOUTS.BUSINESS_MODEL,
    sections: [
      {
        name: 'Problem',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'List your top 3 problems'
      },
      {
        name: 'Solution',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Outline a possible solution for each problem'
      },
      {
        name: 'Unique Value Proposition',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Single, clear, compelling message that states why you are different and worth paying attention to'
      },
      {
        name: 'Unfair Advantage',
        gridIndex: 4,
        icon: Building2.displayName!,
        placeholder: 'Something that cannot be easily copied or bought'
      },
      {
        name: 'Customer Segments',
        gridIndex: 5,
        icon: Users2.displayName!,
        placeholder: 'Target customers and users'
      },
      {
        name: 'Key Metrics',
        gridIndex: 6,
        icon: Receipt.displayName!,
        placeholder: 'Key numbers that tell you how your business is doing'
      },
      {
        name: 'Channels',
        gridIndex: 7,
        icon: Truck.displayName!,
        placeholder: 'Path to customers'
      },
      {
        name: 'Cost Structure',
        gridIndex: 8,
        icon: Coins.displayName!,
        placeholder: 'Fixed and variable costs'
      },
      {
        name: 'Revenue Streams',
        gridIndex: 9,
        icon: Coins.displayName!,
        placeholder: 'Revenue model, lifetime value, revenue, gross margin'
      }
    ]
  },
  threeSectionCanvas: {
    icon: Building2.displayName!,
    name: "Three Section Canvas",
    description: "A canvas with three sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.THREE_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      }
    ]
  },
  fourSectionCanvas: {
    icon: Building2.displayName!,
    name: "Four Section Canvas",
    description: "A canvas with four sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.FOUR_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      },
      {
        name: 'Section Four',
        gridIndex: 4,
        icon: Heart.displayName!,
        placeholder: 'Description or questions for Section Four'
      }
    ]
  },
  fiveSectionCanvas: {
    icon: Building2.displayName!,
    name: "Five Section Canvas",
    description: "A canvas with five sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.FIVE_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      },
      {
        name: 'Section Four',
        gridIndex: 4,
        icon: Heart.displayName!,
        placeholder: 'Description or questions for Section Four'
      },
      {
        name: 'Section Five',
        gridIndex: 5,
        icon: Truck.displayName!,
        placeholder: 'Description or questions for Section Five'
      }
    ]
  },
  sixSectionCanvas: {
    icon: Building2.displayName!,
    name: "Six Section Canvas",
    description: "A canvas with six sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.SIX_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      },
      {
        name: 'Section Four',
        gridIndex: 4,
        icon: Heart.displayName!,
        placeholder: 'Description or questions for Section Four'
      },
      {
        name: 'Section Five',
        gridIndex: 5,
        icon: Truck.displayName!,
        placeholder: 'Description or questions for Section Five'
      },
      {
        name: 'Section Six',
        gridIndex: 6,
        icon: Receipt.displayName!,
        placeholder: 'Description or questions for Section Six'
      }
    ]
  },
  sevenSectionCanvas: {
    icon: Building2.displayName!,
    name: "Seven Section Canvas",
    description: "A canvas with seven sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.SEVEN_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      },
      {
        name: 'Section Four',
        gridIndex: 4,
        icon: Heart.displayName!,
        placeholder: 'Description or questions for Section Four'
      },
      {
        name: 'Section Five',
        gridIndex: 5,
        icon: Truck.displayName!,
        placeholder: 'Description or questions for Section Five'
      },
      {
        name: 'Section Six',
        gridIndex: 6,
        icon: Receipt.displayName!,
        placeholder: 'Description or questions for Section Six'
      },
      {
        name: 'Section Seven',
        gridIndex: 7,
        icon: Coins.displayName!,
        placeholder: 'Description or questions for Section Seven'
      }
    ]
  },
  eightSectionCanvas: {
    icon: Building2.displayName!,
    name: "Eight Section Canvas",
    description: "A canvas with eight sections for specific use cases",
    defaultLayout: CANVAS_LAYOUTS.EIGHT_SECTIONS_LAYOUT_1,
    sections: [
      {
        name: 'Section One',
        gridIndex: 1,
        icon: Users.displayName!,
        placeholder: 'Description or questions for Section One'
      },
      {
        name: 'Section Two',
        gridIndex: 2,
        icon: Workflow.displayName!,
        placeholder: 'Description or questions for Section Two'
      },
      {
        name: 'Section Three',
        gridIndex: 3,
        icon: Gift.displayName!,
        placeholder: 'Description or questions for Section Three'
      },
      {
        name: 'Section Four',
        gridIndex: 4,
        icon: Heart.displayName!,
        placeholder: 'Description or questions for Section Four'
      },
      {
        name: 'Section Five',
        gridIndex: 5,
        icon: Truck.displayName!,
        placeholder: 'Description or questions for Section Five'
      },
      {
        name: 'Section Six',
        gridIndex: 6,
        icon: Receipt.displayName!,
        placeholder: 'Description or questions for Section Six'
      },
      {
        name: 'Section Seven',
        gridIndex: 7,
        icon: Coins.displayName!,
        placeholder: 'Description or questions for Section Seven'
      },
      {
        name: 'Section Eight',
        gridIndex: 8,
        icon: Users2.displayName!,
        placeholder: 'Description or questions for Section Eight'
      }
    ]
  }
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
    canvasLayout: canvasLayout || canvasType.defaultLayout.layout
  });

// Updated helper function to get initial sections map for a specific canvas type
export const getInitialSections = (canvasType: string): Map<string, Section> => {
  const sectionsMap = new Map<string, Section>()
  const canvas = CANVAS_TYPES[canvasType]
  if (!canvas) throw new Error(`Canvas type ${canvasType} not found`)
  
  canvas.sections.forEach(section => {
    sectionsMap.set(section.name, {
      name: section.name,
      items: [],
      qAndAs: [],
      gridIndex: section.gridIndex
    })
  })
  return sectionsMap
} 