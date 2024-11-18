import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' }, 
      { status: 500 }
    )
  }

  try {
    const { currentContent, section } = await request.json()

    const prompt = `As a business model expert, analyze the following business model canvas content and suggest exactly 3 improvements for the specified section. The current content is:

Company Name: ${currentContent.name}
Company Description: ${currentContent.description}

You are providing suggestions for the ${section} section of the Business Model Canvas.
Provide exactly 3 clear, actionable suggestions.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      response_format: { 
        type: "json_schema",
        json_schema: {
          strict: true,
          name: "suggestions",
          schema: {
            type: "object",
            properties: {
              suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: {
                    type: "enum",
                    enum: ["keyPartners", "keyActivities", "keyResources", "valuePropositions", "customerRelationships", "channels", "customerSegments", "costStructure", "revenueStreams"],
                    description: "The section of the Business Model Canvas that the suggestion is for"
                  },
                  suggestion: {
                    type: "string",
                    description: "The suggested improvement"
                  },
                  rationale: {
                    type: "string",
                    description: "Brief explanation of why this suggestion would be valuable"
                  }
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
        }
      }
    )
    return NextResponse.json({
      content: completion.choices[0].message.content
    })

  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI assistance' }, 
      { status: 500 }
    )
  }
}