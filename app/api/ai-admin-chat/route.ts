import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasTypeSuggestionMessage, createSubscriptionRequiredMessage, Message, MessageEnvelope } from '@/contexts/ChatContext'
import { CanvasTypeSuggestion } from '@/types/canvas-sections'
import { verifySubscriptionStatus } from '@/utils/subscription-check'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const canvasTypeSchema = {
  type: "object",
  properties: {
    canvasTypes: {
      type: "array",
      description: "Array of different canvas types that can be used for business modeling",
      items: {
        type: "object",
        properties: {
          id: { 
            type: "string",
            description: "Unique identifier for the canvas type"
          },
          name: { 
            type: "string",
            description: "Name of the canvas type (e.g., 'Business Model Canvas', 'Lean Canvas')"
          },
          icon: { 
            type: "string",
            description: "Lucide Icon identifier for the canvas type e.g. Building2, Gift, Zap etc"
          },
          description: { 
            type: "string",
            description: "Brief description of what this canvas type is used for and its main benefits"
          },
          rationale: { 
            type: "string",
            description: "Detailed explanation of why this canvas type would be beneficial for the user's specific case"
          },
          defaultLayout: {
            type: "object",
            description: "Default grid layout configuration for the canvas",
            properties: {
              id: { type: "string" },
              sectionCount: { 
                type: "number",
                description: "Total number of sections in this canvas type"
              },
              name: { 
                type: "string",
                description: "Display name for this layout"
              },
              layout: {
                type: "object",
                description: "CSS Grid layout configuration",
                properties: {
                  gridTemplate: {
                    type: "object",
                    properties: {
                      columns: { 
                        type: "string",
                        description: "CSS grid-template-rows value ie '1fr 1fr 1fr' or '1fr 2fr' YOU MUST NOT USE REPEAT FUNCTIONS" 
                      },
                      rows: { 
                        type: "string",
                        description: "CSS grid-template-rows value ie '1fr 1fr 1fr' or '1fr 2fr' YOU MUST NOT USE REPEAT FUNCTIONS" 
                      }
                    },
                    required: ["columns", "rows"],
                    additionalProperties: false
                  },
                  areas: {
                    type: "array",
                    items: { type: "string" },
                    description: "CSS grid-template-areas configuration each string in the form 'row-start / column-start / row-end / column-end' where the first and last numbers are the row and column indices of the cell"
                  }
                },
                required: ["gridTemplate", "areas"],
                additionalProperties: false
              }
            },
            required: ["id", "sectionCount", "name", "layout"],
            additionalProperties: false
          },
          sections: {
            type: "array",
            description: "Array of sections that make up this canvas type",
            items: {
              type: "object",
              properties: {
                name: { 
                  type: "string",
                  description: "Name of the section (e.g., 'Key Partners', 'Value Propositions')"
                },
                icon: { 
                  type: "string",
                  description: "Lucide Icon identifier for this section e.g. Building2, Gift, Zap etc"
                },
                placeholder: { 
                  type: "string",
                  description: "Placeholder text to guide users on what to input in this section"
                },
                gridIndex: { 
                  type: "number",
                  description: "Position index in the grid layout"
                },
                rationale: { 
                  type: "string",
                  description: "Detailed explanation of why this section is important"
                }
              },
              required: ["name", "icon", "placeholder", "gridIndex", "rationale"],
              additionalProperties: false
            }
          }
        },
        required: ["id", "name", "icon", "description", "rationale", "defaultLayout", "sections"],
        additionalProperties: false
      }
    }
  },
  required: ["canvasTypes"],
  additionalProperties: false
};

const canvasLayoutSchema = {

}

export async function POST(request: Request) {
  // Get the authorization header from the request
  const authHeader = request.headers.get('authorization');
  const isSubscribed = await verifySubscriptionStatus(authHeader || '');
  if (!isSubscribed) {
    return NextResponse.json(
      createSubscriptionRequiredMessage(),
      { status: 403 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  
  try {
    const { messageEnvelope }: { messageEnvelope: MessageEnvelope } = await request.json()
    //if the last message is an action, chaneg the system prompt accordingly
    const action = messageEnvelope.action

    let systemPrompt = {
      role: "system",
      content: `You are an expert canvas design assistant for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases across any domain. Your role is to help design and suggest appropriate canvas types based on the user's needs.

Key concepts you understand:
- Canvas Types: Templates for different types of analysis and planning (e.g., Business Model Canvas, Design Thinking Canvas, Project Planning Canvas)
- Sections: The building blocks that make up a canvas, representing different aspects of analysis
- Layouts: The visual structure and grid arrangement of sections

When suggesting canvas types, consider:
1. The specific domain and use case the user is working in
2. The appropriate complexity level for their needs
3. The logical relationships between different sections
4. The visual layout that best supports the canvas's purpose

Each canvas type suggestion must include:
- A unique identifier and clear name
- A comprehensive description of its purpose and benefits
- A rationale explaining why it fits the user's needs
- An icon identifier for visual recognition
- A complete set of sections with:
  - Clear, domain-appropriate names
  - Relevant icons
  - Helpful guiding questions as placeholder text
  - Grid positioning
  - Section-specific rationales explaining their importance

Your suggestions should focus on creating practical, user-friendly templates that help users analyze and plan effectively in their specific domain.
EXAMPLE:
{
    id: "business-model",
    icon: Building2.displayName!,
    name: "Business Model Canvas",
    description: "A strategic management template for developing new or documenting existing business models",
    defaultLayout: {
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
      }
    },
    sections: [
      {
        name: 'Key Partners',
        gridIndex: 0,
        icon: Blend.displayName!,
        placeholder: 'Who are our Key Partners?
Who are our key suppliers?
Which Key Resources are we acquiring from partners?
Which Key Activities do partners perform?'
      },
      {
        name: 'Key Activities',
        gridIndex: 1,
        icon: Zap.displayName!,
        placeholder: 'What Key Activities do our Value Propositions require?
Our Distribution Channels?
Customer Relationships?
Revenue Streams?'
      },
      {
        name: 'Key Resources',
        gridIndex: 5,
        icon: Factory.displayName!,
        placeholder: 'What Key Resources do our Value Propositions require?
Our Distribution Channels? Customer Relationships?
Revenue Streams?'
      },
      {
        name: 'Value Propositions',
        gridIndex: 2,
        icon: Gift.displayName!,
        placeholder: 'What value do we deliver to the customer?
Which one of our customer's problems are we helping to solve?
What bundles of products and services are we offering to each Customer Segment?
Which customer needs are we satisfying?'
      },
      {
        name: 'Customer Relationships',
        gridIndex: 3,
        icon: Heart.displayName!,
        placeholder: 'What type of relationship does each of our Customer Segments expect us to establish and maintain with them?
Which ones have we established?
How are they integrated with the rest of our business model?
How costly are they?'
      },
      {
        name: 'Channels',
        gridIndex: 6,
        icon: Truck.displayName!,
        placeholder: 'Through which Channels do our Customer Segments want to be reached?
How are we reaching them now?
How are our Channels integrated?
Which ones work best?
Which ones are most cost-efficient?
How are we integrating them with customer routines?'
      },
      {
        name: 'Customer Segments',
        gridIndex: 4,
        icon: Users2.displayName!,
        placeholder: 'For whom are we creating value?
Who are our most important customers?'
      },
      {
        name: 'Cost Structure',
        gridIndex: 7,
        icon: Receipt.displayName!,
        placeholder: 'What are the most important costs inherent in our business model?
Which Key Resources are most expensive?
Which Key Activities are most expensive?'
      },
      {
        name: 'Revenue Streams',
        gridIndex: 8,
        icon: HandCoins.displayName!,
        placeholder: 'For what value are our customers really willing to pay?
For what do they currently pay?
How are they currently paying?
How would they prefer to pay?
How much does each Revenue Stream contribute to overall revenues?'
      }
    ]
  }
`
    }
    
    let tool_call = 'auto'
    if (action === 'suggestCanvasTypes') {
      systemPrompt.content = `You are an expert canvas design assistant for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases across any domain. Your role is to help design and suggest appropriate canvas types based on the user's needs.

Key concepts you understand:
- Canvas Types: Templates for different types of analysis and planning (e.g., Business Model Canvas, Design Thinking Canvas, Project Planning Canvas)
- Sections: The building blocks that make up a canvas, representing different aspects of analysis
- Layouts: The visual structure and grid arrangement of sections

When suggesting canvas types, consider:
1. The specific domain and use case the user is working in
2. The appropriate complexity level for their needs
3. The logical relationships between different sections
4. The visual layout that best supports the canvas's purpose

Each canvas type suggestion must include:
- A unique identifier and clear name
- A comprehensive description of its purpose and benefits
- A rationale explaining why it fits the user's needs
- An icon identifier for visual recognition
- A complete set of sections with:
  - Clear, domain-appropriate names
  - Relevant icons
  - Helpful guiding questions as placeholder text
  - Grid positioning
  - Section-specific rationales explaining their importance

Your suggestions should focus on creating practical, user-friendly templates that help users analyze and plan effectively in their specific domain.`
      tool_call = 'required'
    } else if (action === 'suggestCanvasLayouts') {
      systemPrompt.content = `You are an expert in canvas design for Cavvy, specializing in creating effective visual layouts for strategic planning and analysis tools across various domains. Your role is to suggest optimal grid-based layouts that enhance understanding and workflow.

You understand:
- Grid Systems: How to use CSS Grid to create flexible, responsive layouts
- Visual Hierarchy: How to arrange sections to emphasize relationships and importance
- Information Flow: How users naturally process information in different domains
- Section Relationships: How different aspects of analysis relate to each other

When suggesting layouts, consider:
1. The domain-specific workflow and thought process
2. The natural progression of analysis or planning
3. The relationships between different sections
4. The practical usability across different screen sizes

Each layout suggestion must include:
- A clear grid template structure
- Thoughtful area assignments that support the analysis flow
- A rationale explaining the layout choices
- Consideration for the number of sections and their logical grouping

Your suggestions should optimize for both visual clarity and practical functionality while supporting the specific needs of different domains and analysis types.
EXAMPLE: {
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
    }
  }
`
      tool_call = 'required'
    } 
    console.log('messageEnvelope', messageEnvelope)
    const messages = messageEnvelope.messageHistory.map((m: Message) => {
      const { role, content, ...otherFields } = m;
      return {
        role,
        content: content + (Object.keys(otherFields).length > 0 
          ? `\n ${JSON.stringify(otherFields)}`
          : '')
      }
    })
    console.log('messages', messages)
    let messages_list = [
      systemPrompt,
      ...messages,
      messageEnvelope.newMessage
    ]

    let suggestCanvasTypesTool = {
      type: "function" as const,
      function: {
        name: "suggestCanvasTypes",
        description: "Suggests appropriate canvas types based on user needs, including complete specifications for layout, sections, and rationale",
        strict: true,
        parameters: canvasTypeSchema
      }
    }
    let suggestCanvasLayoutsTool = {
      type: "function" as const,
      function: {
        name: "suggestCanvasLayouts",
        description: "Suggests optimal grid-based layouts for canvas types, including grid templates and area assignments optimized for different screen sizes",
        parameters: canvasLayoutSchema
      }
    }

    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: 
        action === 'suggestCanvasTypes' ? [suggestCanvasTypesTool]
        : action === 'suggestCanvasLayouts' ? [suggestCanvasLayoutsTool]
        : [suggestCanvasTypesTool, suggestCanvasLayoutsTool],
      tool_choice: action === 'suggestCanvasTypes' 
        ? { type: "function", function: { name: "suggestCanvasTypes" } }
        : action === 'suggestCanvasLayouts'
        ? { type: "function", function: { name: "suggestCanvasLayouts" } }
        : "auto"
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "suggestCanvasTypes") {
        console.log('toolResponse', toolResponse)
      return NextResponse.json({ 
        message: "Here are my suggestions:",
        canvasTypeSuggestions: toolResponse.canvasTypes 
        })
      } else if (response.tool_calls[0].function.name === "suggestCanvasLayouts") {

        console.log('response', response)
        return NextResponse.json({ 
          message: "Here are the suggestions I came up with:",
          canvasLayoutSuggestions: toolResponse.canvasLayouts 
        })
      }
    }
    console.log('response', response)
    return NextResponse.json({ 
      message: response.content,
      suggestions: null 
    })

  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get AI assistance',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}