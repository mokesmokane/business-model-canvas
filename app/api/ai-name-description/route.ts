import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage, MessageEnvelope } from '@/contexts/ChatContext'
import { verifySubscriptionStatus } from '@/utils/subscription-check'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const nameCanvasSchema = {
    type: "object",
    properties: {
      canvasName: {
        type: "string",
        description: "Name of the new canvas",
      },
      canvasDescription: {
        type: "string",
        description: "A description of project that the canvas is for",
      },
    },
    required: ["canvasName", "canvasDescription"],    
    additionalProperties: false
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
    const { messageEnvelope }: { messageEnvelope: MessageEnvelope } = await request.json()

    let systemPrompt = {
      role: "system",
      content: `You are an expert canvas design assistant for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases across any domain. 
      Your role is to help users with any questions they have about canvas types, sections, and layouts.
      Your current role is to help users name and describe their canvas based on the limited information provided by the user in previous messages
      The name should reflect what they are using the canvas for not the canvas type.
      The description should be a short description of the project that the canvas is for.
      The description should be no more than 100 characters.

}
`
    }
     const  tool_call = 'required'

    let messages_list = [
      systemPrompt,
      ...messageEnvelope.messageHistory,
      messageEnvelope.newMessage
    ]

    let nameDescriptionTool = {
      type: "function" as const,
      function: {
        name: "nameDescription",
        description: "Suggests a name and description for the new canvas based on the conversation history",
        strict: true,
        parameters: nameCanvasSchema
      }
    }

    console.log('messages_list', messages_list)
 
    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [nameDescriptionTool],
      tool_choice: tool_call
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "nameDescription") {
        return NextResponse.json({ 
          name: toolResponse.canvasName,
          description: toolResponse.canvasDescription
        })
      }
    }

    return NextResponse.json({ 
      message: response.content
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