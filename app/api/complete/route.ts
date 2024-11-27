import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { CanvasSection, CanvasType } from '@/types/canvas-sections'
import { Canvas, Section } from '@/types/canvas'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict'
})

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
    Provide exactly 3 different natural completions, each on a new line.
    Keep completions concise, business-focused, and varied.
    Only provide the completions, no explanations or numbering.
    
    For reference: 
    ${canvas.canvasType.sections
      .map((s) => `- ${s.name}: ${s.placeholder}`)
      .join('\n')}
    `

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: [
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
      ],
      maxTokens: 100,
      temperature: 0.7
    })

    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Error in completion:', error)
    return new Response('Error in completion', { status: 500 })
  }
} 