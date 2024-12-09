import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext'
import { verifySubscriptionStatus } from '@/utils/subscription-check'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

function suggestionsToolSchema(sections: string[]) {
  return {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            content: { 
              type: "string", 
              description: "The suggested content to add to the section" 
            },
            rationale: { 
              type: "string", 
              description: "Brief explanation of why this content is relevant" 
            }
          },
          required: ["content", "rationale"],
          additionalProperties: false
        }
      }
    },
    required: ["suggestions"],
    additionalProperties: false
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
  console.log('generating suggestions')
  try {
    const { 
      parentCanvas, 
      newCanvas, 
      diveItem,
      sectionToGenerate 
    } = await request.json()

    const systemPrompt = {
      role: "system",
      content: `You are helping to generate content for a new canvas that was created by "diving deeper" into a specific item from a parent canvas.

      The user wants to explore this item in more detail:
      "${diveItem.content}"

      Parent Canvas Context:
      ${JSON.stringify(parentCanvas, null, 2)}

      New Canvas Type:
      ${JSON.stringify(newCanvas.canvasType, null, 2)}

      You are generating suggestions for the "${sectionToGenerate.name}" section.
      Section Description: ${sectionToGenerate.placeholder}

      Generate 3-5 relevant items for this section, considering:
      1. The relationship to the dive item from the parent canvas
      2. The purpose of this section in the new canvas
      3. Logical connections to other sections`
    }

    const completion = await openai.chat.completions.create({
      messages: [systemPrompt] as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [{
        type: "function",
        function: {
          name: "suggestions",
          description: 'Provide structured suggestions for the current section',
          parameters: suggestionsToolSchema([sectionToGenerate.name])
        }
      }],
      tool_choice: { type: "function", function: { name: "suggestions" } }
    })

    const response = completion.choices[0].message
    console.log(response)
    if (response.tool_calls) {
      console.log('tool call')
      console.log(response.tool_calls[0].function.arguments)
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      return NextResponse.json(toolResponse.suggestions)
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