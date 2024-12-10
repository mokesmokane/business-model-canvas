import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasType } from '@/types/canvas-sections'
import { CanvasTypeAdminService } from '@/services/canvasTypeAdminService'
import { DiveInRequest, NewCanvasDiveResponse, NewCanvasTypeSuggestion } from '../types'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext'
import { verifySubscriptionStatus } from '@/utils/subscription-check'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})



const getCanvasTypeString = (canvasType: CanvasType, index: number) => {
  return `${index} - ${canvasType.name} (${canvasType.description}) Sections(${canvasType.sections.length}): ${canvasType.sections.map(s => s.name).join(', ')}`
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
    return createSubscriptionRequiredMessage()
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const requestData: DiveInRequest = await request.json()

    const systemPrompt = {
      role: "system",
      content: `You are an expert canvas design assistant for Cavvy. Your task is to analyze an item from an existing canvas and suggest a kind of canvas to create to dive deeper into that item.

Context:
- Parent Canvas: ${requestData.parentCanvas.name} (${requestData.parentCanvas.canvasType.name})
- Section: ${requestData.section.name} (${requestData.section.placeholder})
- Item to explore: ${requestData.item.content}

When suggesting creating a canvas type consider:
1. The specific focus of the item being explored
2. How it relates to the parent canvas's purpose
3. The appropriate level of detail needed
4. The logical structure that best supports deep diving into this item

An example of a canvas type is:
${JSON.stringify(requestData.parentCanvas.canvasType, null, 2)}

You should suggest up to 1-3 canvas types that best fit the use case.`
    }

    const suggestCanvasTypesSchema = {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { 
                type: "string",
                description: "The name of the canvas type"
              },
              icon: {
                type: "string",
                description: "The icon of the canvas type from the Lucide icon library"
              },
              description: { 
                type: "string",
                description: "A short description of the canvas type. What purpose does it serve?"
              },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { 
                      type: "string",
                      description: "The name of the section"
                    },
                    placeholder: { 
                      type: "string",
                      description: "Questions that help the user understand the section. Questions that when answered will help the user create content for this section."
                    }
                  },
                  required: ["name", "placeholder"]
                }
              },
              rationale: { 
                type: "string",
                description: "A rationale for why this canvas type is appropriate for the item"
              }
            }
          },
          required: ["name", "description", "sections", "rationale"]
          }
        },
      required: ["suggestions"]
    }

    const messages = [
      systemPrompt,
      {
        role: "user",
        content: "Please analyze the context and suggest appropriate canvas types for diving deeper into this item."
      }
    ]

    const completion = await openai.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [{
        type: "function",
        function: {
          name: "suggestCanvasTypes",
          description: "Suggests appropriate canvas types and provides initial content",
          parameters: suggestCanvasTypesSchema
        }
      }],
      tool_choice: { type: "function", function: { name: "suggestCanvasTypes" } }
    })

    const response = completion.choices[0].message
    console.log(response)
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      const newCanvasTypesResponse: NewCanvasDiveResponse  = {
        suggestions: toolResponse.suggestions as NewCanvasTypeSuggestion[]
      }
      
      return NextResponse.json(newCanvasTypesResponse)
    }

    return NextResponse.json({ 
      error: 'Unexpected response format from AI'
    }, { status: 500 })

  } catch (error) {
    console.error('AI canvas dive error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process canvas dive request',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
} 