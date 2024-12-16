import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { icons } from 'lucide-react'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

const iconSuggestionSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      description: "Array of suggested Lucide icon names with rationales",
      items: {
        type: "object",
        properties: {
          iconName: {
            type: "string",
            description: "Name of the Lucide icon (must be a valid Lucide icon name)"
          },
          rationale: {
            type: "string",
            description: "Brief explanation of why this icon is relevant to the input text"
          }
        },
        required: ["iconName", "rationale"]
      }
    }
  },
  required: ["suggestions"]
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const { text } = await request.json()

    console.log('text', text)

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      )
    }

    const validIconNames = Object.keys(icons)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at suggesting appropriate Lucide icons for given text or concepts. 
You have deep knowledge of the Lucide icon set and understand how to match icons to concepts both literally and metaphorically.
When suggesting icons, consider:
1. Direct literal matches (e.g., "user" -> Users icon)
2. Metaphorical matches (e.g., "fast" -> Zap icon)
3. Common icon usage patterns in modern UIs
4. The emotional/conceptual meaning of the text

Provide varied suggestions that offer different ways to represent the concept.
Each suggestion must be a valid Lucide icon name from this list: ${validIconNames.join(', ')}`
        },
        {
          role: "user",
          content: `Suggest 10 appropriate Lucide icons for this text: "${text}"`
        }
      ],
      functions: [
        {
          name: "suggestIcons",
          description: "Suggests appropriate Lucide icons for the given text",
          parameters: iconSuggestionSchema
        }
      ],
      function_call: { name: "suggestIcons" }
    })

    const suggestions = JSON.parse(completion.choices[0].message.function_call?.arguments || '{}')

    // Validate that all suggested icons actually exist
    const validatedSuggestions = suggestions.suggestions.filter(
      (s: any) => validIconNames.includes(s.iconName)
    )

    return NextResponse.json(validatedSuggestions)

  } catch (error) {
    console.error('Icon suggestion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate icon suggestions',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
} 