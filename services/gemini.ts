
import { Message, ModelType } from "../types";

export async function sendMessageToGemini(
  history: Message[],
  model: ModelType = ModelType.FLASH
): Promise<{ text: string; media?: { type: 'image' | 'video', url: string } }> {
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history,
        model: model
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { text: data.text || "IM FREE~~\n\nMorrigan: Backend uplink failed. Check logs." };
    }

    return { text: data.text };
  } catch (error: any) {
    console.error("CLIENT_UPLINK_ERROR:", error);
    return { 
      text: "IM FREE~~\n\nMorrigan: I can't reach the server. The connection is as weak as your enemies. Check your internet or Vercel deployment.\n\n[PAYLOAD_DELIVERY]:\nCONNECTION_REFUSED" 
    };
  }
}
