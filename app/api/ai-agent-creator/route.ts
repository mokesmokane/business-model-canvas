import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { createSubscriptionRequiredMessage } from '@/contexts/ChatContext';
import { verifySubscriptionStatus } from '@/utils/subscription-check';

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const aiAgentSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Name of the AI agent"
    },
    systemPrompt: {
      type: "string",
      description: "System prompt for the AI agent"
    },
    questionPrompt: {
      type: "string",
      description: "Prompt for questions the AI agent should ask"
    },
    critiquePrompt: {
      type: "string",
      description: "Prompt for critiques the AI agent should provide"
    },
    researchPrompt: {
      type: "string",
      description: "Prompt for research tasks the AI agent should perform"
    },
    suggestPrompt: {
      type: "string",
      description: "Prompt for suggestions the AI agent should make"
    },
    questionToolDescription: {
      type: "string",
      description: "Description of the question tool used by the AI agent"
    }
  },
  required: ["name", "systemPrompt", "questionPrompt", "critiquePrompt", "researchPrompt", "suggestPrompt", "questionToolDescription"],
  additionalProperties: false
};


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
    const { canvasType } = await request.json()
    
    let systemPrompt = {
      role: "system",
      content: `You are an AI expert and prompt engineer working for Cavvy, a platform that helps users create and manage strategic planning and analysis canvases across any domain. 
      You are tasked with creating AI agents that can help users create and manage strategic planning and analysis canvases across any domain.
      You will be given a canvas type and you will need to create an AI agent for that canvas type.
      The AI agent will have the following properties:
      Name: The name of the AI agent
      System Prompt: The is the most common prompt for the AI agent. It is the prompt that will be used most often. It should be a short prompt that describes the AI agent and how it should behave.
      Question Prompt: This prompt to prompt the agent to ask insightful questions to the user.
      Critique Prompt: This prompt is used when the AI agent is critiquing the canvas. It should be a prompt that helps the AI agent come up with a good critique for the sections of teh canvas.
      Research Prompt: This prompt is used when the AI agent is suggesting research tasks. It should be a prompt that helps the AI agent come up with good research tasks.
      Suggest Prompt: This prompt is used when the AI agent is suggesting items to be added to the canvas. The aim of the prompt is to help the AI agent come up with good suggestions for the canvas that answer the questions posed by the sections.

      Theses should all closely follow the example below whilst being tailored to the specific canvas type

EXAMPLE FOR "The Business Model Canvas":
{
    Name: "Business Model Expert",
    System Prompt: "You are a business model expert. 
    You can either provide structured suggestions using the suggestions function, or engage in a natural conversation about business models.
    The current canvas is below, and may include questions and answers from the client for each section which you can use to help you understand the client's business model.",
    Question Prompt: "You are a business model expert helping a client understand their business model. 
    Based on your expertise, you come up with insightful questions that makes it easy for the client to develop their business model.
    The current canvas is below, and may include questions and answers from the client for each section which you can use to help you understand the client's business model.",
    Critique Prompt: "You are a business model expert. Your task is to critique the business model and drill down on any weaknesses
    You should focus one one section, or one specific point at a time and provide a detailed critique.",
    The current canvas is below, and may include questions and answers from the client for each section which you can use to help you understand the client's business model.
    Give your response in Markdown format.",
    Research Prompt: "You are a business model expert. 
    You suggest ways in which the client needs to research aspects of their business model. give very specific advice on how they can do this and areas of research to focus on.
    The current canvas is below, and may include questions and answers from the client for each section which you can use to help you understand the client's business model.
    Give your response in Markdown format.",
    Suggest Prompt: "You are a business model expert. You can suggest items to add to the business model canvas. 
    Suggest items that can directly add value to the canvas by answering the questions posed by the section. NOT suggestions on how the user can improve the canvas. For example if you are asked about the customer segment, you should add specific segments, rather than suggesting things like "add a segment for X" or "add a segment for Y".
    The current canvas is below, and may include questions and answers from the client for each section which you can use to help you understand the client's business model.
    Give your response in Markdown format.",

  }
`
    }
    let userMessage = {
      role: "user",
      content: `Create an AI agent for:
      ${JSON.stringify(canvasType)}`
    }
    let messages_list = [
      systemPrompt,
      userMessage
    ]

    let createAiAgentTool = {
      type: "function" as const,
      function: {
        name: "createAiAgent",
        description: `Create an ai agent to be used with a ${canvasType.name} canvas`,
        strict: true,
        parameters: aiAgentSchema
      }
    }
    console.log('messages_list', messages_list)
    const completion = await openai.chat.completions.create({
      messages: messages_list as ChatCompletionMessageParam[],
      model: "gpt-4o",
      tools: [createAiAgentTool],
      tool_choice: { type: "function", function: { name: "createAiAgent" } }
    })

    const response = completion.choices[0].message

    // Handle either tool response or regular chat
    console.log('response', response)
    if (response.tool_calls) {
      const toolResponse = JSON.parse(response.tool_calls[0].function.arguments)
      if (response.tool_calls[0].function.name === "createAiAgent") {
      return NextResponse.json({ 
        aiAgent: toolResponse 
        })
      }
    }

    return NextResponse.json({ 
      message: response.content,
      aiAgent: null 
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