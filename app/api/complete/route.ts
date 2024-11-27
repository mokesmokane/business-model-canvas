import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict'
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that completes sentences. Provide exactly 3 different natural completions, each on a new line. Keep completions concise and varied. Only provide the completions, no explanations or numbering."
        },
        {
          role: "user",
          content: `Complete this sentence in 3 different ways: "${text}"`
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