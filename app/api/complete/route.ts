import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { CanvasSection, CanvasType } from '@/types/canvas-sections'
import { Canvas, Section } from '@/types/canvas'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Define the function schema
const completionFunction = {
  name: 'provide_completions',
  description: 'Provides three different completions for the given text',
  parameters: {
    type: 'object',
    properties: {
      completions: {
        type: 'array',
        description: 'Array of three different completion suggestions',
        items: {
          type: 'string'
        },
        minItems: 3,
        maxItems: 3
      }
    },
    required: ['completions']
  }
}

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { text, canvas, section }: { 
      text: string, 
      canvas: Canvas,   
      section: Section 
    } = await req.json()

    const canvasType = canvas.canvasType
    const canvasWithoutType = { ...canvas, canvasType: undefined }
    const systemPrompt = `You are a ${canvasType.name} assistant helping complete sentences for the "${section.name}" section. 
    Consider the context of ${section.name} when providing completions.
    Provide exactly 3 different natural completions that are concise, business-focused, and varied.
    Only provide the completions, no explanations or numbering.
    They should be wildly different from each other in tone and style, or length or seriousness.

    For reference: 
    ${canvas.canvasType.sections
      .map((s) => `- ${s.name}: ${s.placeholder}`)
      .join('\n')}
    `
    const msgs = [
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: `The current state of the canvas is: ${JSON.stringify(canvasWithoutType)}`
        },
        {
            role: "user",
            content: `The current state of the section that the user is editing is: ${JSON.stringify(section)}`
        },
        {
            role: "user",
            content: `Complete this sentence for the ${section.name} section: "${text}"`
        }
    ] as ChatCompletionMessageParam[]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: msgs,
      functions: [completionFunction],
      function_call: { name: 'provide_completions' },
      temperature: 0.7
    })

    const functionResponse = completion.choices[0].message.function_call?.arguments
    if (!functionResponse) {
      throw new Error('No completion generated')
    }

    const { completions } = JSON.parse(functionResponse)
    
    return new Response(JSON.stringify({ completions }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error in completion:', error)
    return new Response('Error in completion', { status: 500 })
  }
} 