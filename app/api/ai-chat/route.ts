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

const questionSchema = {
  type: "object",
  properties: {
    questions: { 
      type: "array", 
      items: { 
        type: "object",
        properties: {
          question: { 
            type: "string",
            description: "The question text to ask the user"
          },
          type: { 
            type: "string",
            enum: ["open", "rating", "multipleChoice"],
            description: "The type of question to ask"
          },
          section: {
            type: "string",
            enum: ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"],
            description: "The section of the Business Model Canvas that the suggestion is for"
          },
          options: {
            type: "array",
            items: { type: "string" },
            description: "For multipleChoice questions, provide the options. For other question types, provide an empty array."
          },
          scale: {
            type: "object",
            properties: {
              min: { type: "number" },
              max: { type: "number" },
              label: { type: "string" }
            },
            required: ["min", "max", "label"],
            additionalProperties: false,
            description: "For rating questions, provide the scale configuration. For other question types, provide null values."
          }
        },
        required: ["question", "type", "options", "scale", "section"],
        additionalProperties: false
      }
    }
  },
  required: ["questions"],
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
    //if the last message is an action, chaneg the system prompt accordingly
    const action = messages[messages.length - 1].action
    let canvasInfo = `The Canvas currently looks like this:
      
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

    let systemPrompt = {
      role: "system",
      content: `You are a business model expert. 
      You can either provide structured suggestions using the business_model_suggestions function, or engage in a natural conversation about business models.

      ${canvasInfo}
      
      `
    }
    let tool_call = 'auto'
    if (action === 'question') {
      systemPrompt.content = `You are a business model expert helping a client understand their business model. 
      Based on your expertise, you come up with insightful questions that makes it easy for the client to develop their business model.
      give your response in Markdown format.
      ${canvasInfo}
      `
      tool_call = 'required'
    } else if (action === 'critique') {
      systemPrompt.content = `You are a business model expert. Your task is to critique the business model and drill down on any weaknesses
        You should focus one one section, or one specific point at a time and provide a detailed critique.
        Give your response in Markdown format.

      ${canvasInfo}
      `
    } else if (action === 'research') {
      systemPrompt.content = `You are a business model expert. 
      You suggest ways in which the client needs to research aspects of their business model. give very specific advice on how they can do this and areas of research to focus on.
      Give your response in Markdown format.
      ${canvasInfo}
      `
    } else if (action === 'suggest') {
      systemPrompt.content = `You are a business model expert. You can suggest items to add to the business model canvas.
      
      ${canvasInfo}
      `
      tool_call = 'required'
    }

    let messages_list = [
      systemPrompt,
      ...expanded_messages
    ]

    //print out messages for debugging
    console.log(messages_list)
    let questionTool = {
      type: "function" as const,
      function: {
        name: "questions",
        description: "Ask up to 3 questions to the client about their business model. ask question to help the client surface their thoughts and ideas about their business model. You will later use the data to help them further",
        strict: true,
        parameters: questionSchema
      }
    }
    let suggestTool = {
      type: "function" as const,
      function: {
        name: "business_model_suggestions",
        description: "Provide structured suggestions for improving a section of the Business Model Canvas",
        parameters: businessModelSchema
      }
    }
    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: 
        action === 'suggest' ? [suggestTool]
        : action === 'question' ? [questionTool]
        : [suggestTool, questionTool],
      tool_choice: "auto"
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "business_model_suggestions") {
      return NextResponse.json({ 
        message: "Here are my suggestions:",
        suggestions: toolResponse.suggestions 
        })
      } else if (response.tool_calls[0].function.name === "questions") {
        console.log('questions tool call', toolResponse)

        return NextResponse.json({ 
          message: "Here are the questions I came up with:",
          questions: toolResponse.questions 
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