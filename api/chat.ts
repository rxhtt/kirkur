
import { GoogleGenAI, Modality } from "@google/genai";
import { MASTER_PROMPT } from "../systemPrompt";

export const config = {
  runtime: 'edge',
};

// Helper: Generate Embeddings using Gemini
async function getEmbedding(text: string, apiKey: string) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] }
      })
    });
    const data = await res.json();
    return data.embedding.values;
  } catch (e) {
    console.error("Embedding Error:", e);
    return null;
  }
}

// Helper: Pinecone Vector Operations
async function pineconeAction(action: 'upsert' | 'query', payload: any) {
  const apiKey = process.env.PINECONE_API_KEY;
  const host = process.env.PINECONE_HOST; // e.g., "your-index-name-abc.svc.pinecone.io"
  if (!apiKey || !host) return null;

  try {
    const res = await fetch(`https://${host}/vectors/${action}`, {
      method: 'POST',
      headers: { 
        'Api-Key': apiKey,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) {
    console.error("Pinecone Error:", e);
    return null;
  }
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { messages, model, fileData, voiceOutput, location, sessionId } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const apiKey = process.env.API_KEY || "";
    
    let textResult = "";
    let audioResult = null;
    let contextHistory = "";

    // 1. PINECONE RETRIEVAL: Get relevant past context
    if (lastUserMessage && process.env.PINECONE_API_KEY) {
      const vector = await getEmbedding(lastUserMessage, apiKey);
      if (vector) {
        const queryRes = await pineconeAction('query', {
          vector,
          topK: 3,
          includeMetadata: true,
          namespace: sessionId || "global-history"
        });
        if (queryRes?.matches) {
          contextHistory = queryRes.matches
            .map((m: any) => `[RECALLED_MEMORY]: ${m.metadata.text}`)
            .join("\n");
        }
      }
    }

    // 2. ROUTING & EXECUTION
    
    if (model === 'youtube-recon-v3') {
      const ytKey = process.env.YOUTUBE_API_KEY;
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(lastUserMessage)}&maxResults=5&key=${ytKey}`);
      const data = await res.json();
      const results = data.items?.map((item: any) => `- ${item.snippet.title} (https://youtube.com/watch?v=${item.id.videoId})`).join('\n') || "No data intercepted.";
      textResult = `[YOUTUBE_RECON_COMPLETE]\n\nMorrigan: Scanned the tubes for '${lastUserMessage}'.\n\n${results}`;
    } 
    
    else if (model === 'weather-satellite-v1') {
      const weatherKey = process.env.WEATHER_API_KEY;
      const query = location ? `lat=${location.latitude}&lon=${location.longitude}` : `q=${encodeURIComponent(lastUserMessage || "London")}`;
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${weatherKey}&units=metric`);
      const data = await res.json();
      textResult = data.cod === 200 
        ? `[SATELLITE_LINK] Morrigan: Intercepted data for ${data.name}. ${data.weather[0].description}, ${data.main.temp}°C.` 
        : `Morrigan: Weather link failed. ${data.message}.`;
    }

    else if (model === 'exa-osint-neural') {
      const exaKey = process.env.EXA_API_KEY;
      const res = await fetch("https://api.exa.ai/search", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': exaKey || "" },
        body: JSON.stringify({ query: lastUserMessage, numResults: 5, useAutoprompt: true })
      });
      const data = await res.json();
      const links = data.results?.map((r: any) => `- ${r.title}: ${r.url}`).join('\n') || "Neural search returned null.";
      textResult = `[EXA_NEURAL_UPLINK]\n\nMorrigan: Deep-crawled the net.\n\n${links}`;
    }

    else if (model.includes('llama')) {
      // Groq Implementation
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}` 
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: MASTER_PROMPT + "\n\nRelevant Context:\n" + contextHistory },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
          ],
        })
      });
      const data = await res.json();
      textResult = data.choices?.[0]?.message?.content || "Morrigan: Groq uplink timed out.";
    }

    else if (model.includes('gemini')) {
      const ai = new GoogleGenAI({ apiKey });
      const contents = messages.map((m: any, idx: number) => {
        const parts: any[] = [{ text: m.content }];
        if (idx === messages.length - 1 && fileData) {
          parts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.base64.split(',')[1] } });
        }
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      const response = await ai.models.generateContent({
        model: model,
        contents,
        config: { 
          systemInstruction: MASTER_PROMPT + "\n\nContext Recalled from Memory Bank:\n" + contextHistory,
          temperature: 0.9, 
          tools: [{ googleSearch: {} }] 
        },
      });
      textResult = response.text || "";
    } 

    else if (model.includes('gpt') || model.includes('deepseek')) {
      const isDeepSeek = model.includes('deepseek');
      const apiEndpoint = isDeepSeek ? "https://api.deepseek.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const authKey = isDeepSeek ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: MASTER_PROMPT + "\n\nContext:\n" + contextHistory },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
          ],
        })
      });
      const data = await res.json();
      textResult = data.choices?.[0]?.message?.content || "Morrigan: External uplink failed.";
    }

    // 3. VOICE OUTPUT (TTS)
    if (voiceOutput && textResult) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const tts = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: textResult.replace(/\[.*?\]/g, '').slice(0, 400) }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
          }
        });
        audioResult = tts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      } catch (e) { console.error("TTS_ERR", e); }
    }

    // 4. PINECONE UPSERT: Save the new exchange to memory
    if (textResult && process.env.PINECONE_API_KEY) {
      const combinedText = `User: ${lastUserMessage}\nAssistant: ${textResult}`;
      const vector = await getEmbedding(combinedText, apiKey);
      if (vector) {
        await pineconeAction('upsert', {
          vectors: [{
            id: `msg_${Date.now()}`,
            values: vector,
            metadata: { text: combinedText, timestamp: Date.now() }
          }],
          namespace: sessionId || "global-history"
        });
      }
    }

    return new Response(JSON.stringify({ text: textResult, audio: audioResult }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ text: `[SYSTEM_FATAL]: ${error.message}` }), { status: 500 });
  }
}
