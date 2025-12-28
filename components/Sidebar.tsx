
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  isOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings
}) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[70] w-[300px] glass transform transition-transform duration-500 ease-in-out
      md:relative md:translate-x-0 flex flex-col m-0 md:m-4 md:rounded-[2.5rem]
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-4 mb-10 px-2">
           <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <span className="text-xl font-black italic">M</span>
           </div>
           <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Morrigan</h3>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.3em]">Neural Protocol 6.9</p>
           </div>
        </div>

        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black rounded-2xl bg-white text-black hover:bg-gray-200 transition-all uppercase tracking-[0.4em] mb-8 shadow-xl"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Mission
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          <div className="px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-4">Past Operations</div>
          {sessions.length === 0 ? (
            <div className="px-4 py-8 text-center bg-white/5 rounded-3xl border border-white/5">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-loose">No active sessions found in localized storage.</p>
            </div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                className={`
                  group flex items-center justify-between gap-3 px-4 py-4 text-[11px] rounded-[1.5rem] cursor-pointer transition-all border
                  ${currentSessionId === session.id 
                    ? 'bg-red-600/10 border-red-600/20 text-red-500' 
                    : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-white'}
                `}
                onClick={() => onSelectChat(session.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentSessionId === session.id ? 'bg-red-500' : 'bg-gray-700 group-hover:bg-gray-500'}`}></div>
                  <span className="truncate font-bold tracking-tight uppercase">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 rounded-xl text-red-900 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-6 py-4 text-[9px] font-black rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white uppercase tracking-widest"
          >
            System Core
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </button>
          <div className="px-6 text-[8px] font-bold text-gray-700 uppercase tracking-[0.2em] text-center">
            Secured via Quantum Encryption
          </div>
        </div>
      </div>
    </aside>
  );
};
