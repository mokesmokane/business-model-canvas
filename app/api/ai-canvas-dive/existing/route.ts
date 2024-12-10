import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasType } from '@/types/canvas-sections'
import { CanvasTypeAdminService } from '@/services/canvasTypeAdminService'
import { DiveInRequest, ExistingCanvasDiveResponse, ExistingCanvasTypeSuggestion } from '../types'
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
    const canvasTypes = await getCanvasTypes()
    const canvasTypeMap = Object.values(canvasTypes).reduce((acc, ct, index) => {
      acc[index] = ct;
      return acc;
    }, {} as Record<number, CanvasType>)

    const systemPrompt = {
      role: "system",
      content: `You are an expert canvas design assistant for Cavvy. Your task is to analyze an item from an existing canvas and suggest appropriate canvas types for a detailed exploration of that item.

Context:
- Parent Canvas: ${requestData.parentCanvas.name} (${requestData.parentCanvas.canvasType.name})
- Section: ${requestData.section.name} (${requestData.section.placeholder})
- Item to explore: ${requestData.item.content}

When suggesting canvas types, consider:
1. The specific focus of the item being explored
2. How it relates to the parent canvas's purpose
3. The appropriate level of detail needed
4. The logical structure that best supports deep diving into this item

Available canvas types:
${Object.entries(canvasTypeMap).map(([index, ct]) => getCanvasTypeString(ct, Number(index))).join('\n')}

You should suggest up to 3 existing canvas types`
    }

    const suggestCanvasTypesSchema = {
      type: "object",
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              canvasTypeId: { type: "string" },
              rationale: { type: "string" },
              initialContent: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  sections: {
                    type: "object",
                    additionalProperties: {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                },
                required: ["name", "description", "sections"]
              }
            },
            required: ["canvasTypeId", "rationale", "initialContent"]
          }
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
          description: "Suggests appropriate canvas types",
          parameters: suggestCanvasTypesSchema
        }
      }],
      tool_choice: { type: "function", function: { name: "suggestCanvasTypes" } }
    })

    const openAIResponse = completion.choices[0].message
    console.log(openAIResponse)
    if (openAIResponse.tool_calls) {
      const toolResponse = JSON.parse(openAIResponse.tool_calls[0].function.arguments)
      
      const response: ExistingCanvasDiveResponse = {
        suggestions: toolResponse.suggestions.map((s: any) => ({
          ...s,
          canvasType: canvasTypeMap[s.canvasTypeId]
        } as ExistingCanvasTypeSuggestion)) 
      }
      console.log(response)
      return NextResponse.json(response)
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