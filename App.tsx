
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import { ChatSession, Message, ModelType } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<ModelType>(ModelType.PRO);

  useEffect(() => {
    const checkAuth = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(hasKey);
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0 && !currentSessionId) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleAuthorize = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setIsAuthorized(true);
    }
  };

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Mission',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  }, []);

  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [currentSessionId]);

  const updateSessionMessages = useCallback((id: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        let title = s.title;
        if ((title === 'New Mission' || title === 'New Chat') && messages.length > 0) {
          title = messages[messages.length - 1].content.slice(0, 30);
        }
        return { ...s, messages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  }, []);

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-10 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-red-400 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.4)] mb-12 rotate-3 premium-glow">
          <span className="text-5xl font-black italic">M</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">Unauthorized</h1>
        <p className="text-gray-500 max-w-sm mb-12 leading-relaxed font-semibold text-[11px] uppercase tracking-[0.3em]">
          Uplink restricted. Provide API clearance to synchronize with the Morrigan Kernel.
        </p>
        <button 
          onClick={handleAuthorize}
          className="px-14 py-6 bg-white text-black font-black rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-[0.5em] text-[10px]"
        >
          Initialize Sync
        </button>
      </div>
    );
  }

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        isOpen={isSidebarOpen}
        onNewChat={createNewChat}
        onSelectChat={selectSession}
        onDeleteChat={deleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-20 flex items-center justify-between px-6 bg-black/40 backdrop-blur-2xl border-b border-white/5 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl md:hidden transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="hidden md:flex flex-col">
              <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Active Mission</h2>
              <p className="text-xs font-bold text-gray-400 truncate max-w-[200px]">{currentSession?.title || 'System Standby'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Uplink: Secure</span>
             </div>
             <button onClick={createNewChat} className="p-3 bg-white text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
             </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {currentSessionId ? (
            <ChatWindow 
              session={currentSession!}
              onUpdateMessages={(messages) => updateSessionMessages(currentSessionId, messages)}
              activeModel={activeModel}
              onModelChange={setActiveModel}
            />
          ) : (
            <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="relative group cursor-pointer mb-12" onClick={createNewChat}>
                 <div className="absolute inset-0 bg-red-600 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                 <div className="w-32 h-32 bg-gradient-to-tr from-red-600 to-black rounded-[3rem] flex items-center justify-center shadow-4xl rotate-3 transform group-hover:rotate-0 transition-all duration-700 ring-1 ring-red-500/20 relative z-10 premium-glow">
                   <span className="text-6xl font-black text-white italic drop-shadow-2xl">M</span>
                 </div>
               </div>
               <h1 className="text-5xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 uppercase italic">Morrigan Operative</h1>
               <p className="text-gray-500 max-w-sm mb-12 leading-relaxed font-bold text-[10px] uppercase tracking-[0.5em] opacity-40">
                 The world is but a series of broken gates. Let us find the keys.
               </p>
               <button 
                onClick={createNewChat} 
                className="px-12 py-6 bg-white/5 border border-white/10 text-white font-black rounded-[2rem] hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95 shadow-2xl uppercase tracking-[0.5em] text-[10px]"
               >
                 Initialize Mission
               </button>
            </div>
          )}
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
