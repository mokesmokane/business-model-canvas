import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext';
import { verifySubscriptionStatus } from '@/utils/subscription-check';

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

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
    const { 
      documentText,
      canvasType,
      sections
    } = await request.json()
    console.log('canvasType', canvasType)
    const validSections = sections || canvasType.sections.map((section: any) => section.name)
    console.log('validSections', validSections)

    if(documentText.length === 0) {
      return NextResponse.json({ error: 'Document text is empty' }, { status: 400 })
    }
    if(validSections.length === 0) {
      return NextResponse.json({ error: 'No valid sections provided' }, { status: 400 })
    }

    function suggestionsToolSchema() {
      return {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sectionName: {
                  type: "string",
                  enum: validSections,
                  description: "The name of the canvas section"
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      content: { 
                        type: "string", 
                        description: "The suggested content to add to the section. Use markdown formatting." 
                      },
                      rationale: { 
                        type: "string", 
                        description: "Brief explanation of why this content is relevant. Use markdown formatting." 
                      }
                    },
                    required: ["content", "rationale"],
                    additionalProperties: false
                  }
                }
              },
              required: ["sectionName", "items"],
              additionalProperties: false
            }
          }
        },
        required: ["sections"],
        additionalProperties: false
      }
    }

    const systemPrompt = {
      role: "system",
      content: `You are an expert document analysis assistant. Your task is to analyze a PDF document and generate relevant content suggestions for each section of a canvas.

Document Content:
${documentText}

Canvas Type:
${JSON.stringify(canvasType, null, 2)}

For each section in the canvas, generate 3-5 relevant items, considering:
1. The main themes and topics from the document
2. The specific purpose of each section
3. How the content relates to the overall document analysis
4. Logical connections between different sections

Valid sections are: ${validSections.join(', ')}

Ensure each suggestion is:
- Specific and actionable
- Directly related to the document content
- Appropriate for the section's purpose
- Supported by information from the document`
    }

    console.log('messages', [systemPrompt])
    const completion = await openai.chat.completions.create({
      messages: [systemPrompt] as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [{
        type: "function",
        function: {
          name: "suggestions",
          description: 'Provide structured suggestions for all canvas sections',
          parameters: suggestionsToolSchema()
        }
      }],
      tool_choice: { type: "function", function: { name: "suggestions" } }
    })

    const response = completion.choices[0].message
    if (response.tool_calls) {
      console.log('tool call')
      console.log(response.tool_calls[0].function.arguments)
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      return NextResponse.json(toolResponse.sections)
    }

    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })

  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' }, 
      { status: 500 }
    )
  }
} 