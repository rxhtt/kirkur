
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, ModelType } from '../types';
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
    try {
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
    } catch (e) {
      console.warn("Audio synthesis failed", e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input || (attachedFile ? `Mission data attached: ${attachedFile.name}` : ""),
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
      const pos = await new Promise<GeolocationPosition | null>((res) => {
        navigator.geolocation.getCurrentPosition(res, () => res(null), { timeout: 3000 });
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: newMessages,
          model: activeModel,
          fileData: attachedFile,
          voiceOutput: true,
          location: pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude } : null,
          sessionId: session.id
        })
      });

      const data = await response.json();
      onUpdateMessages([...newMessages, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text,
        timestamp: Date.now()
      }]);

      if (data.audio) decodeAndPlayAudio(data.audio);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const models = [
    { id: ModelType.FLASH, label: 'Cortex Lite', desc: 'Standard Uplink' },
    { id: ModelType.PRO, label: 'Apex Pro', desc: 'Superior Intelligence' },
    { id: ModelType.YOUTUBE, label: 'YT Recon', desc: 'Media Analysis' },
    { id: ModelType.WEATHER, label: 'Sat Weather', desc: 'Meteorological' },
    { id: ModelType.EXA, label: 'Exa Neural', desc: 'Web Context' },
    { id: ModelType.OPENAI, label: 'GPT-4o', desc: 'Creative Reasoning' },
    { id: ModelType.GROQ, label: 'Groq Llama', desc: 'Instant Inference' },
    { id: ModelType.DEEPSEEK, label: 'DeepSeek', desc: 'Technical Logic' }
  ];

  const currentModelLabel = models.find(m => m.id === activeModel)?.label || "Select Model";

  return (
    <div className="flex-1 flex flex-col relative h-full bg-black">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-40 pt-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {session.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-10 animate-in fade-in duration-1000">
               <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-full border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Morrigan Online</span>
               </div>
               <div className="space-y-4">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase opacity-80">System Ready</h2>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    {['Analyze Image', 'Search Net'].map(s => (
                       <button key={s} onClick={() => setInput(s)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                          {s}
                       </button>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            session.messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          
          {isLoading && (
            <div className="flex items-center gap-4 px-8 py-5 glass rounded-full w-fit border border-white/5 animate-pulse ml-4">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-bounce [animation-delay:0.2s]"></div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Processing...</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 z-50">
        <div className="max-w-3xl mx-auto relative">
          {showModelMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-6 glass rounded-[2.5rem] border border-white/10 p-3 shadow-4xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Vector Protocols</p>
              </div>
              <div className="max-h-64 overflow-y-auto no-scrollbar grid grid-cols-1 gap-1 py-1">
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange(m.id); setShowModelMenu(false); }}
                    className={`flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all ${activeModel === m.id ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
                  >
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider">{m.label}</p>
                      <p className={`text-[8px] font-bold uppercase opacity-60`}>{m.desc}</p>
                    </div>
                    {activeModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-2 glass rounded-[2.5rem] border border-white/10 shadow-4xl flex items-center gap-2">
            <button 
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="px-4 md:px-5 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black text-white/60 hover:text-white rounded-[1.8rem] transition-all uppercase tracking-[0.2em] shrink-0"
            >
              {currentModelLabel}
            </button>

            <div className="flex-1 relative flex items-center min-w-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Command..."
                className="w-full bg-transparent py-4 px-2 focus:outline-none text-white placeholder:text-white/20 text-sm font-medium resize-none max-h-32 no-scrollbar"
                disabled={isLoading}
                rows={1}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0 pr-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-white/30 hover:text-white transition-all rounded-full hidden sm:block"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>

              <button 
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all ${isListening ? 'text-red-600 animate-pulse' : 'text-white/30 hover:text-white'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
              </button>

              <div className="w-11 h-11 flex-shrink-0">
                {isLoading ? (
                  <button 
                    onClick={stopGeneration}
                    className="w-full h-full flex items-center justify-center bg-red-600 text-white rounded-full shadow-2xl active:scale-90 transition-all"
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
                  </button>
                ) : (
                  <button 
                    onClick={handleSendMessage}
                    className="w-full h-full flex items-center justify-center bg-white text-black disabled:opacity-10 active:scale-95 transition-all shadow-2xl rounded-full"
                    disabled={(!input.trim() && !attachedFile)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const r = new FileReader(); r.onload = (ev) => setAttachedFile({ base64: ev.target?.result as string, mimeType: f.type, name: f.name });
            r.readAsDataURL(f);
          }} />

          {attachedFile && (
            <div className="absolute bottom-full left-0 mb-4 px-5 py-2 glass rounded-full border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest truncate max-w-[120px]">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-white/10 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
