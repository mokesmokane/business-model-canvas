import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { AIAgent } from "@/types/canvas";
import { db } from "../lib/firebase";
import { CanvasType } from "@/types/canvas-sections";
import { aiAgentCreatorService } from "./aiAgentCreatorService";


export class AIAgentService {

  userId?: string;


  initialize(userId: string) {
    this.userId = userId;
  }
  

  async getAIAgent(agentId: string, userId?: string): Promise<AIAgent | null> {
    try {
      // First check standard agents
      console.log("agentId", agentId)
      const standardDocRef = doc(db, "aiAgents", agentId);
      const standardDocSnap = await getDoc(standardDocRef);
      console.log("standardDocSnap", standardDocSnap)
      if (standardDocSnap.exists()) {
        return { ...standardDocSnap.data() } as AIAgent;
      }
      console.log("userId", userId)
      // If not found and userId provided, check custom agents
      if (userId) {

        const customDocRef = doc(collection(db, 'userAIAgents', userId, 'aiAgents'), agentId);
        console.log("customDocRef", customDocRef)
        const customDocSnap = await getDoc(customDocRef);
        console.log("customDocSnap", customDocSnap)
        
        if (customDocSnap.exists()) {
          return { ...customDocSnap.data() } as AIAgent;
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching AI Agent:", error);
      return null;
    }
  }

  async createandSaveAIAgent(canvasType: CanvasType, idToken: string): Promise<AIAgent | null> {
    const agent= await aiAgentCreatorService.createAIAgent(canvasType, idToken);
    if (agent && this.userId) {
      await this.saveCustomAIAgent(canvasType.id, agent, this.userId);
    }
    return agent;
  }

  async getAiAgents(): Promise<Record<string, AIAgent>> {
    try {
      // Get standard agents
      const standardAgents = await this.getStandardAiAgents();
      
      // If no userId, return only standard agents
      if (!this.userId) {
        return standardAgents;
      }

      // Get custom agents
      const customAgents = await this.getCustomAiAgents(this.userId);

      // Merge both collections, with custom agents overriding standard ones if same ID
      console.log('standardAgents', standardAgents)
      console.log('customAgents', customAgents)
      return {
        ...standardAgents,
        ...customAgents
      };
    } catch (error) {
      console.error("Error fetching AI Agents:", error);
      return {};
    }
  }

  private async getStandardAiAgents(): Promise<Record<string, AIAgent>> {
    const docRef = collection(db, "aiAgents");
    const docSnap = await getDocs(docRef);

    return docSnap.docs.reduce((acc, doc) => {
      acc[doc.id] = { ...doc.data() } as AIAgent;
      return acc;
    }, {} as Record<string, AIAgent>);
  }

  private async getCustomAiAgents(userId: string): Promise<Record<string, AIAgent>> {
    const docRef = collection(db, 'userAIAgents', userId, 'aiAgents');
    const docSnap = await getDocs(docRef);

    return docSnap.docs.reduce((acc, doc) => {
      acc[doc.id] = { ...doc.data() } as AIAgent;
      return acc;
    }, {} as Record<string, AIAgent>);
  }

  async saveCustomAIAgent(id: string, aiAgent: AIAgent, userId: string): Promise<void> {
    try {
        const canvasRef = doc(collection(db, 'userAIAgents', userId, 'aiAgents'), id);
        await setDoc(canvasRef, aiAgent);
    } catch (error) {
        console.error("Error saving custom canvas type: ", error);
        throw error;
    }
}
  
  async updateAIAgent(canvasTypeId: string, data: AIAgent): Promise<void> {
    try {
      const docRef = doc(db, "aiAgents", canvasTypeId);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating AI Agent:", error);
    }
  }
} 

export const aiAgentService = new AIAgentService();