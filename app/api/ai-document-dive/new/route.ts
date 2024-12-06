import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasType } from '@/types/canvas-sections'
import { CanvasTypeAdminService } from '@/services/canvasTypeAdminService'
import { DiveInRequest, DocumentDiveInRequest, NewCanvasDiveResponse, NewCanvasTypeSuggestion } from '../types'

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
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const requestData: DocumentDiveInRequest = await request.json()

    const systemPrompt = {
      role: "system",
      content: `You are an expert document analysis assistant for Cavvy. Your task is to analyze a PDF document and suggest new types of canvases that could be created to organize and explore its content.

Context:
- Document Content: ${requestData.documentText}

When suggesting new canvas types, consider:
1. The main themes and topics covered in the document
2. The document's structure and organization
3. Key concepts that would benefit from deeper exploration
4. The most effective way to break down and analyze the information

You should suggest 1-3 new canvas types that would be most appropriate for organizing and analyzing this document's content. Each canvas type should have a clear purpose and logical sections.`
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