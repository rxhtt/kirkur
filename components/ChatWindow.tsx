
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, ModelType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  session: ChatSession;
  onUpdateMessages: (messages: Message[]) => void;
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  onUpdateMessages,
  activeModel,
  onModelChange
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ base64: string, mimeType: string, name: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [session.messages, isLoading]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { setIsListening(false); return; }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const decodeAndPlayAudio = async (base64: string) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: input || (attachedFile ? `Analyze file: ${attachedFile.name}` : ""),
      timestamp: Date.now(),
      media: attachedFile ? { type: attachedFile.mimeType.startsWith('image') ? 'image' : 'video' as any, url: attachedFile.base64 } : undefined
    };

    const newMessages = [...session.messages, userMsg];
    onUpdateMessages(newMessages);
    
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);
    setShowModelMenu(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newMessages,
          model: activeModel,
          fileData: attachedFile,
          voiceOutput: true
        })
      });

      const data = await response.json();
      onUpdateMessages([...newMessages, {
        id: uuidv4(),
        role: 'assistant',
        content: data.text,
        timestamp: Date.now()
      }]);

      if (data.audio) decodeAndPlayAudio(data.audio);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Generation halted by user.");
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const models = [
    { id: ModelType.PRO, label: 'Apex Pro', icon: '💎', desc: 'Reasoning & Multi-modal' },
    { id: ModelType.FLASH, label: 'Cortex Lite', icon: '⚡', desc: 'Fast Search' },
    { id: ModelType.OPENAI, label: 'GPT-4o', icon: '🤖', desc: 'OpenAI Precision' },
    { id: ModelType.GROQ, label: 'Groq Llama', icon: '🌪️', desc: 'Instant Inference' },
    { id: ModelType.DEEPSEEK, label: 'DeepSeek V3', icon: '🌊', desc: 'Logic Expert' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-10 pointer-events-none" />
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-52 pt-24 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          {session.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in fade-in zoom-in duration-1000">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center shadow-3xl rotate-12 transition-transform hover:rotate-0">
                <span className="text-5xl font-black text-white italic">M</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">System Online</h1>
            </div>
          ) : (
            session.messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          
          {isLoading && (
            <div className="flex items-center gap-4 px-8 py-6 glass rounded-[2.5rem] w-fit border border-white/5 animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:0.2s]"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Synthesizing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 pb-10 bg-gradient-to-t from-black via-black to-transparent z-20">
        <div className="max-w-2xl mx-auto relative">
          
          {showModelMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-6 glass rounded-[3rem] border border-white/10 p-3 shadow-4xl animate-in slide-in-from-bottom-10">
              <div className="px-6 py-4 border-b border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Vector Select</p>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar py-2">
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange(m.id); setShowModelMenu(false); }}
                    className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] transition-all ${activeModel === m.id ? 'bg-white/10 border border-white/10 scale-[1.02]' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="text-left flex-1">
                      <p className="text-xs font-black text-white uppercase tracking-wider">{m.label}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase">{m.desc}</p>
                    </div>
                    {activeModel === m.id && <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_12px_red]"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.endsWith('/')) setShowModelMenu(true);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Command Morrigan..."
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] py-6 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-red-600/30 text-white placeholder:text-gray-600 transition-all text-sm font-medium shadow-3xl resize-none max-h-40"
                disabled={isLoading}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-4 bottom-4 p-2.5 text-gray-500 hover:text-white transition-all"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>

              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                </button>
                
                {isLoading ? (
                  <button 
                    onClick={stopGeneration}
                    className="p-3 bg-red-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </button>
                ) : (
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-white rounded-full text-black disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    disabled={(!input.trim() && !attachedFile)}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className={`p-5 rounded-[2rem] border transition-all ${showModelMenu ? 'bg-red-600 border-red-500 text-white' : 'bg-[#1c1c1e] border-white/5 text-gray-500 hover:text-white'}`}
            >
              <div className="text-xl leading-none">
                {models.find(m => m.id === activeModel)?.icon}
              </div>
            </button>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const r = new FileReader(); r.onload = (ev) => setAttachedFile({ base64: ev.target?.result as string, mimeType: f.type, name: f.name });
            r.readAsDataURL(f);
          }} />

          <div className="mt-6 flex justify-center gap-10 opacity-30">
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Encrypted Uplink</span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Vector: {models.find(m => m.id === activeModel)?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
