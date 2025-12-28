
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
      // Check if user has already selected a key
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(hasKey);
      } else {
        // Fallback for environments without the aistudio global
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
      // Per instructions: assume success after triggering the dialog to avoid race conditions
      setIsAuthorized(true);
    }
  };

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Chat',
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
        if (title === 'New Chat' && messages.length > 0) {
          title = messages[0].content.slice(0, 40);
        }
        return { ...s, messages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  }, []);

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-white p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-black rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/40 mb-8 border border-red-500/30">
          <span className="text-5xl font-black italic">M</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase">Identity Verification Required</h1>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed font-mono text-xs uppercase tracking-widest">
          To access the Morrigan Operative kernel, you must authorize via a valid Gemini API Key from a paid GCP project.
          <br/><br/>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-red-500 underline">Review Billing Docs</a>
        </p>
        <button 
          onClick={handleAuthorize}
          className="px-12 py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 uppercase tracking-[0.3em] text-xs"
        >
          Grant Access
        </button>
      </div>
    );
  }

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen w-full bg-[#111] text-[#ececec] overflow-hidden selection:bg-red-500/30">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)} />
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

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-14 flex items-center justify-between px-4 bg-[#111]/80 backdrop-blur-md border-b border-red-500/10 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg md:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 rounded-full cursor-pointer hover:bg-red-600/20 transition-all border border-red-600/20">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">MORRIGAN LIVE</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <button onClick={createNewChat} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </header>

        {currentSessionId ? (
          <ChatWindow 
            session={currentSession!}
            onUpdateMessages={(messages) => updateSessionMessages(currentSessionId, messages)}
            activeModel={activeModel}
            onModelChange={setActiveModel}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="relative mb-8">
               <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-black rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/20 rotate-6 transform hover:rotate-0 transition-transform ring-1 ring-red-500/40">
                <span className="text-5xl font-black text-white italic">M</span>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-white uppercase">Morrigan Operative</h1>
            <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-mono text-xs uppercase tracking-[0.2em]">
              High-fidelity visual synthesis. Neural grounding. Infinite memory.
            </p>
            <button onClick={createNewChat} className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 uppercase tracking-widest text-xs">
              Initiate Operation
            </button>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
