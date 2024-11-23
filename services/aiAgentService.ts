import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { AIAgent } from "@/types/canvas";
import { db } from "../lib/firebase";
import { CanvasType } from "@/types/canvas-sections";


export class AIAgentService {

  async getAIAgent(agentId: string): Promise<AIAgent | null> {
    try {
      const docRef = doc(db, "aiAgents", agentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...docSnap.data() } as AIAgent;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching AI Agent:", error);
      return null;
    }
  }

  async getAiAgents(): Promise<Record<string,AIAgent>> {
    try {
      const docRef = collection(db, "aiAgents");
      const docSnap = await getDocs(docRef);

      return docSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = { ...doc.data() } as AIAgent;
        return acc;
      }, {} as Record<string, AIAgent>);
    } catch (error) {
      console.error("Error fetching AI Agents:", error);
      return {};
    }
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