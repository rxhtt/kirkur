
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export const ModelType = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview',
  OPENAI: 'gpt-4o',
  GROQ: 'llama-3.1-70b-versatile',
  DEEPSEEK: 'deepseek-v3',
  YOUTUBE: 'youtube-recon-v3',
  WEATHER: 'weather-satellite-v1',
  EXA: 'exa-osint-neural'
} as const;

export type ModelType = typeof ModelType[keyof typeof ModelType];
