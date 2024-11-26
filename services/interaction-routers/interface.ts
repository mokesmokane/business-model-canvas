import { AIAgent } from "@/types/canvas";
import { Message } from "@/contexts/ChatContext";

export interface InteractionRouter {
    //a function which takes a set of messages and returns a function to process those messages
    getRoute: (messages: Message[], formData: any|null, aiAgent: AIAgent | null) => 
        (messages: Message[]) => AsyncGenerator<Message, void, unknown>
}