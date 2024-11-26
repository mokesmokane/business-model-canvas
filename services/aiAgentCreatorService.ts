import { AIAgent } from "@/types/canvas";
import { CanvasType } from "@/types/canvas-sections";

export class AIAgentCreatorService {
  async createAIAgent(canvasType: CanvasType): Promise<AIAgent | null> {
    try {
      const response = await fetch('/api/ai-agent-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ canvasType }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI agent');
      }

      const data = await response.json();
      if (data.aiAgent) {
        return data.aiAgent;
      }
      return null;
    } catch (error) {
      console.error('Error creating AI agent:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiAgentCreatorService = new AIAgentCreatorService(); 