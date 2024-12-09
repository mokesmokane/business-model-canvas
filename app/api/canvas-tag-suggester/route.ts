import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { TAG_INFO } from '@/src/constants/tags'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext'
import { verifySubscriptionStatus } from '@/utils/subscription-check'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Define the available tags
const AVAILABLE_TAGS = TAG_INFO.map((tag) => tag.name)

const tagSuggesterSchema = {
  type: "object",
  properties: {
    suggestedTags: {
      type: "array",
      items: {
        type: "string",
        enum: AVAILABLE_TAGS
      },
      description: "List of suggested tags from the predefined list that are relevant to this canvas type"
    }
  },
  required: ["suggestedTags"],
  additionalProperties: false
};

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
    const { canvasType } = await request.json()
    
    const systemPrompt = {
      role: "system",
      content: `You are a canvas classification expert for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases.
      Your task is to suggest the most relevant tags for different types of canvases from a predefined list.
      You should suggest between 2-5 tags that best categorize the canvas type.
      Only suggest tags from the following list: ${AVAILABLE_TAGS.join(", ")}`
    }

    const userMessage = {
      role: "user",
      content: `Suggest appropriate tags for this canvas type: ${canvasType}`
    }

    const tagSuggesterTool = {
      type: "function" as const,
      function: {
        name: "suggestTags",
        description: `Suggest appropriate tags for a ${canvasType} canvas`,
        strict: true,
        parameters: tagSuggesterSchema
      }
    }

    const completion = await openai.chat.completions.create({
      messages: [systemPrompt, userMessage] as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [tagSuggesterTool],
      tool_choice: { type: "function", function: { name: "suggestTags" } }
    })

    const response = completion.choices[0].message

    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "suggestTags") {
        return NextResponse.json({ 
          suggestedTags: toolResponse.suggestedTags 
        })
      }
    }

    return NextResponse.json({ 
      message: response.content,
      suggestedTags: [] 
    })

  } catch (error) {
    console.error('Tag suggestion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get tag suggestions',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
} 