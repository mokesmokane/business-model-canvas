import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured')
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { currentContent } = await request.json()

    const prompt = `As a business model expert, analyze the following business model canvas content and suggest improvements or fill in missing sections. The current content is:

Company Name: ${currentContent.companyName}
Company Description: ${currentContent.companyDescription}

Please provide suggestions for each section of the Business Model Canvas. Keep each section concise but insightful.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
    })

    const suggestions = parseAIResponse(completion.choices[0].message.content || '')

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI assist error:', error)
    return NextResponse.json({ error: 'Failed to get AI assistance' }, { status: 500 })
  }
}

function parseAIResponse(response: string) {
  // You'll need to implement proper parsing based on the AI response format
  // This is a simplified example
  return {
    keyPartners: response,
    keyActivities: response,
    keyResources: response,
    valuePropositions: response,
    customerRelationships: response,
    channels: response,
    customerSegments: response,
    costStructure: response,
    revenueStreams: response,
  }
} 