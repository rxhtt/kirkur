
import { GoogleGenAI, Modality } from "@google/genai";
import { MASTER_PROMPT } from "../systemPrompt";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { messages, model, fileData, voiceOutput, location } = await req.json();
    
    // Switch between providers based on model selection
    // Note: We use process.env to keep keys safe.
    let providerResponse;
    let textResult = "";
    let audioResult = null;

    if (model.includes('gemini')) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const contents = messages.map((m: any, idx: number) => {
        const parts: any[] = [{ text: m.content }];
        if (idx === messages.length - 1 && fileData) {
          parts.push({
            inlineData: { mimeType: fileData.mimeType, data: fileData.base64.split(',')[1] }
          });
        }
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      const response = await ai.models.generateContent({
        model: model,
        contents,
        config: { 
          systemInstruction: MASTER_PROMPT,
          temperature: 0.9,
          tools: [{ googleSearch: {} }] 
        },
      });
      textResult = response.text || "";

      // Handle TTS if requested
      if (voiceOutput) {
        const tts = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: textResult.slice(0, 400) }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
          }
        });
        audioResult = tts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      }
    } else if (model.includes('gpt') || model.includes('deepseek')) {
      // Use OpenAI/DeepSeek compatible API
      const isDeepSeek = model.includes('deepseek');
      const apiEndpoint = isDeepSeek ? "https://api.deepseek.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const apiKey = isDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "system", content: MASTER_PROMPT }, ...messages.map((m: any) => ({ role: m.role, content: m.content }))],
        })
      });
      const data = await res.json();
      textResult = data.choices?.[0]?.message?.content || "";
    } else if (model.includes('llama')) {
      // Groq Implementation
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "system", content: MASTER_PROMPT }, ...messages.map((m: any) => ({ role: m.role, content: m.content }))],
        })
      });
      const data = await res.json();
      textResult = data.choices?.[0]?.message?.content || "";
    }

    return new Response(JSON.stringify({ text: textResult, audio: audioResult }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ text: `[SYSTEM_HALT]: ${error.message}` }), { status: 500 });
  }
}
