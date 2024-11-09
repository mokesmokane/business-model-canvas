import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Message } from '@/contexts/ChatContext'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const businessModelSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"],
            description: "The section of the Business Model Canvas that the suggestion is for"
          },
          suggestion: { type: "string", description: "The suggested improvement" },
          rationale: { type: "string", description: "Brief explanation of why this suggestion would be valuable" }
        },
        required: ["suggestion", "rationale"],
        additionalProperties: false
      }
    }
  },
  required: ["suggestions"],
  additionalProperties: false
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const { currentContent, messages } = await request.json()
    
    // Expand any messages that contain suggestions into individual messages
    const expanded_messages = messages.flatMap((msg: Message) => {
      if (msg.suggestions) {
        return msg.suggestions.map((suggestion) => ({
          role: "assistant",
          content: `Suggestion for ${suggestion.section}:\n${suggestion.suggestion}\n\nRationale: ${suggestion.rationale}`
        }))
      }
      return [msg]
    })

    let messages_list = [
      {
        role: "system",
        content: `You are a business model expert. You can either provide structured suggestions using the business_model_suggestions function, or engage in a natural conversation about business models.

        The Canvas currently looks like this:
        
        Company Name: ${currentContent.companyName}
        Company Description: ${currentContent.companyDescription}

        Key Partners: ${currentContent.keyPartners}
        Key Activities: ${currentContent.keyActivities}
        Key Resources: ${currentContent.keyResources}
        Value Propositions: ${currentContent.valuePropositions}
        Customer Relationships: ${currentContent.customerRelationships}
        Channels: ${currentContent.channels}
        Customer Segments: ${currentContent.customerSegments}
        Cost Structure: ${currentContent.costStructure}
        Revenue Streams: ${currentContent.revenueStreams}
        
        `
      },
      ...expanded_messages
    ]

    //print out messages for debugging
    console.log(messages_list)

    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [
        {
          type: "function",
          function: {
            name: "business_model_suggestions",
            description: "Provide structured suggestions for improving a section of the Business Model Canvas",
            parameters: businessModelSchema
          }
        }
      ],
      tool_choice: "auto"
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      return NextResponse.json({ 
        message: "Here are my suggestions:",
        suggestions: toolResponse.suggestions 
      })
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