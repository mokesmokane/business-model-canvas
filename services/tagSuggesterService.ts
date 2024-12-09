import { CanvasSection } from '@/types/canvas-sections';
import { getAuth } from 'firebase/auth';

interface TagSuggestionRequest {
  name: string;
  description: string;
  sections: CanvasSection[];
}

export class TagSuggesterService {
  async getSuggestedTags(request: TagSuggestionRequest): Promise<string[]> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No user');
    const idToken = await user?.getIdToken();
    if (!idToken) throw new Error('No idToken');

    const response = await fetch('/api/canvas-tag-suggester', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
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