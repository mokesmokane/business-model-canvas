import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Message } from '@/contexts/ChatContext'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// const sections = ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"]



function suggestionsToolSchema(sections:string[],canvasName:string) {
  return {
    type: "object",
    properties: {
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: sections,
              description: `The section of the ${canvasName} that the suggestion is for`
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
}

function questionSchema(sections:string[],canvasName:string) {
  return {
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
            enum: sections,
            description: `The section of the ${canvasName} that the question is for`
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
}
export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const { currentContent, messages, aiAgent } = await request.json()
    const sections = Object.keys(currentContent?.sections || {})
    const canvasName = currentContent?.canvasType?.name || ''
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
    
    let spromt = aiAgent.systemPrompt
    let questionPrompt = aiAgent.questionPrompt
    let critiquePrompt = aiAgent.critiquePrompt
    let researchPrompt = aiAgent.researchPrompt
    let suggestPrompt = aiAgent.suggestPrompt
    let questionToolDescription = aiAgent.questionToolDescription

    
    let canvasInfo = `The Canvas currently looks like this:
      
      Name: ${currentContent?.name ?? ''}
      Description: ${currentContent?.description ?? ''}

      ${Object.entries(currentContent?.sections || {}).map(([key, section]: [string, any]) => `
      ${section.name}:
      Items: ${section.items?.join('\n') ?? ''}
      Q&A: ${section.qAndAs?.map((qa: { question: string; answer?: string | number; type: string; scale?: { max: number; label: string } }) => {
        let formattedAnswer = 'Unanswered';
        if (qa.answer !== undefined) {
          if (qa.type === 'rating' && qa.scale) {
            formattedAnswer = `${qa.answer}/${qa.scale.max} (${qa.scale.label})`;
          } else if (qa.type === 'multipleChoice') {
            formattedAnswer = `Selected: ${qa.answer}`;
          } else {
            formattedAnswer = String(qa.answer);
          }
        }
        return `\nQ: ${qa.question}\nA: ${formattedAnswer}`;
      }).join('\n') ?? ''}`).join('\n\n')}`
    

    let systemPrompt = {
      role: "system",
      content: `${spromt}

      ${canvasInfo}
      
      `
    }
    let tool_call = 'auto'
    if (action === 'question') {
      systemPrompt.content = `${questionPrompt}

      ${canvasInfo}
      `
      tool_call = 'required'
    } else if (action === 'critique') {
      systemPrompt.content = `${critiquePrompt}

      ${canvasInfo}
      `
    } else if (action === 'research') {
      systemPrompt.content = `${researchPrompt}

      ${canvasInfo}
      `
    } else if (action === 'suggest') {
      systemPrompt.content = `${suggestPrompt}

      ${canvasInfo}
      `
      tool_call = 'required'
    }

    let messages_list = [
      systemPrompt,
      ...expanded_messages
    ]

    let questionTool = {
      type: "function" as const,
      function: {
        name: "questions",
        description: questionToolDescription,
        strict: true,
        parameters: questionSchema(sections, canvasName)
      }
    }

    let suggestTool = {
      type: "function" as const,
      function: {
        name: "suggestions",
        description: 'Provide structured suggestions for improving a section of the Canvas',
        parameters: suggestionsToolSchema(sections, canvasName)
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
      if (response.tool_calls[0].function.name === "suggestions") {
      return NextResponse.json({ 
        message: "Here are my suggestions:",
        suggestions: toolResponse.suggestions 
        })
      } else if (response.tool_calls[0].function.name === "questions") {

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
