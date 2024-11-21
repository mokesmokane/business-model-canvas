import { CanvasSection } from '@/types/canvas-sections';

interface TagSuggestionRequest {
  name: string;
  description: string;
  sections: CanvasSection[];
}

export class TagSuggesterService {
  async getSuggestedTags(request: TagSuggestionRequest): Promise<string[]> {
    const response = await fetch('/api/canvas-tag-suggester', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tag suggestions');
    }

    const data = await response.json();
    
    if (!data.suggestedTags) {
      throw new Error('No tag suggestions received');
    }

    return data.suggestedTags;
  }
} 