import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage, MessageEnvelope } from '@/contexts/ChatContext'
import { CanvasSection, CanvasType } from '@/types/canvas-sections'
import { CanvasTypeAdminService } from '@/services/canvasTypeAdminService'
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

const getSuggestCanvasTypesSchema = (number: number) => {
  return {
    type: "object",
    properties: {
      canvasTypes: {
        type: "array",
        description: "Array of canvas type ids that best fit the user's needs",
        items: {
          type: "string",
          enum: Array.from({ length: number }, (_, i) => i.toString())
        }
      },
      newCanvasType: {
        type: "object",
        description: "A description of a potential new type of canvas containing the name, sections, and purpose of the new canvas type to create",
        properties: {
          canvasType: { 
            type: "string",
            description: "Name of the new canvas type"
          },
          sections: {
            type: "array",
            description: "Array of sections that make up this canvas type",
            items: { type: "string" }
          },
          purpose: {
            type: "string",
            description: "Brief description of what this canvas type is used for and its main benefits"
          }
        },
        required: ["canvasType", "sections", "purpose"],
        additionalProperties: false
      }
    },
    required: ["canvasTypes", "newCanvasType"],
    additionalProperties: false
  }
}

const suggestNewCanvasTypeSchema = {
  type: "object",
  properties: {
    canvasType: { 
      type: "string",
      description: "Name of the new canvas type"
    },
    sections: {
      type: "array",
      description: "Array of sections that make up this canvas type",
      items: { type: "string" }
    },
    purpose: {
      type: "string",
      description: "Brief description of what this canvas type is used for and its main benefits"
    }
  },
  required: ["canvasType", "sections", "purpose"],
  additionalProperties: false
}

function getCanvasTypeString(canvasType: CanvasType, index: number) {
  return `${index} - ${canvasType.name} (${canvasType.description}) Sections(${canvasType.sections.length}): ${canvasType.sections.map((s: CanvasSection) => s.name).join(', ')}`
}

async function getCanvasTypes(): Promise<Record<string, CanvasType>> {
  try {
    const canvasTypeService = new CanvasTypeAdminService();
    return await canvasTypeService.getCanvasTypes();
  } catch (error) {
    console.error("Error fetching canvas types:", error);
    return {};
  }
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
    //we should get the canvas types from firestore
    const canvasTypes = await getCanvasTypes()
    //i need to create a Record<int, CanvasType> of index to canvastype
    const canvasTypeMap = Object.values(canvasTypes).reduce((acc, ct, index) => {
      acc[index] = ct;
      return acc;
    }, {} as Record<number, CanvasType>)
    

    let systemPrompt = {
      role: "system",
      content: `You are an expert canvas design assistant for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases across any domain. 
      Your role is to help users with any questions they have about canvas types, sections, and layouts.
      You can also suggest canvas types to the user they might want to use.

Key concepts you understand:
- Canvas Types: Templates for different types of analysis and planning (e.g., Business Model Canvas, Design Thinking Canvas, Project Planning Canvas)
- Sections: The building blocks that make up a canvas, representing different aspects of analysis
- Layouts: The visual structure and grid arrangement of sections

You can suggest existing canvas types to the user. You can also suggest a new canvas type to the user. And when the user wants to create a new canvas type, you can create it for them.

When suggesting canvas types, consider:
1. The specific domain and use case the user is working in
2. The appropriate complexity level for their needs
3. The logical relationships between different sections
4. The visual layout that best supports the canvas's purpose

    ${Object.entries(canvasTypeMap).map(
      ([index, ct]) => getCanvasTypeString(ct, Number(index))
    ).join('\n')} 
`
    }
     const  tool_call = 'auto'

    let messages_list = [
      systemPrompt,
      ...messageEnvelope.messageHistory,
      messageEnvelope.newMessage
    ]

    let suggestCanvasTypesTool = {
      type: "function" as const,
      function: {
        name: "suggestCanvasTypes",
        description: "Suggests appropriate canvas types from the list of available canvas types based on user needs",
        strict: true,
        parameters: getSuggestCanvasTypesSchema(Object.values(canvasTypes).length)
      }
    }

    let suggestNewCanvasTypeTool = {
      type: "function" as const,
      function: {
        name: "suggestNewCanvasType",
        description: "Creates a new canvas type",
        strict: true,
        parameters: suggestNewCanvasTypeSchema
      }
    }

    let createNewCanvasTypeTool = {
      type: "function" as const,
      function: {
        name: "createNewCanvasType",
        description: "Creates a new canvas type",
        strict: true,
        parameters: canvasTypeSchema
      }
    }
 
    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [suggestCanvasTypesTool, suggestNewCanvasTypeTool, createNewCanvasTypeTool],
      tool_choice: tool_call
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "suggestCanvasTypes") {
        console.log('toolResponse', toolResponse)
      return NextResponse.json({ 
        message: "Here are my suggestions:",
        canvasTypeSuggestions: toolResponse.canvasTypes.map((id: string) => canvasTypeMap[parseInt(id)].id),
        newCanvasType: toolResponse.newCanvasType
        })
      } else if (response.tool_calls[0].function.name === "createNewCanvasType") {

        return NextResponse.json({ 
          message: "Creating new canvas type",
          newCanvasType: toolResponse.canvasType
        })
      }
    }

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