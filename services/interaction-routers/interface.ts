import { AIAgent } from "@/types/canvas";
import { Message, MessageEnvelope } from "@/contexts/ChatContext";

export interface InteractionRouter {
    //a function which takes a set of messages and returns a function to process those messages
    getRoute: (messageEnvelope: MessageEnvelope, formData: any|null, aiAgent: AIAgent | null) => 
        (messageEnvelope: MessageEnvelope) => AsyncGenerator<Message, void, unknown>
}