import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasType } from '@/types/canvas-sections'
import { CanvasTypeAdminService } from '@/services/canvasTypeAdminService'
import { DiveInRequest, DocumentDiveInRequest, ExistingCanvasDiveResponse, ExistingCanvasTypeSuggestion } from '../types'
import { verifySubscriptionStatus } from '@/utils/subscription-check'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext'

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
    const requestData: DocumentDiveInRequest = await request.json()
    const canvasTypes = await getCanvasTypes()
    const canvasTypeMap = Object.values(canvasTypes).reduce((acc, ct, index) => {
      acc[index] = ct;
      return acc;
    }, {} as Record<number, CanvasType>)

    const systemPrompt = {
      role: "system",
      content: `You are an expert document analysis assistant for Cavvy. Your task is to analyze the content of a PDF document and suggest appropriate canvas types for organizing and exploring its key concepts.

Context:
- Document Content: ${requestData.documentText}

When analyzing the document and suggesting canvas types, consider:
1. The main themes and topics covered in the document
2. The document's structure and organization
3. Key concepts that would benefit from deeper exploration
4. The most logical way to break down and analyze the information

Available canvas types:
${Object.entries(canvasTypeMap).map(([index, ct]) => getCanvasTypeString(ct, Number(index))).join('\n')}

You should suggest up to 3 existing canvas types that would be most appropriate for organizing and analyzing this document's content.`
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
        content: "Please analyze the document content and suggest appropriate canvas types for organizing and exploring this information."
      }
    ]
    console.log('messages', messages)
    const completion = await openai.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [{
        type: "function",
        function: {
          name: "suggestCanvasTypes",
          description: "Suggests appropriate canvas types for document analysis",
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