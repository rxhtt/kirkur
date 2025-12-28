
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
      fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0a0a0a] transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 border-r border-red-500/10 flex flex-col
      ${isOpen ? 'translate-x-0 shadow-2xl shadow-red-600/20' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full p-3">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-3 text-sm font-bold rounded-xl bg-red-600/10 hover:bg-red-600/20 transition-all text-red-500 border border-red-600/20 uppercase tracking-widest mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Mission
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          <div className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Operations</div>
          {sessions.map(session => (
            <div 
              key={session.id}
              className={`
                group flex items-center justify-between gap-2 px-3 py-2.5 text-xs rounded-xl cursor-pointer transition-all border
                ${currentSessionId === session.id 
                  ? 'bg-red-600/10 border-red-600/20 text-red-500 font-bold' 
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}
              `}
              onClick={() => onSelectChat(session.id)}
            >
              <span className="truncate flex-1 font-mono">{session.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }}
                className="hidden group-hover:flex p-1 hover:bg-red-600/20 rounded text-red-900"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-red-500/10">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-3 text-[10px] font-black rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-red-500 uppercase tracking-widest"
          >
            System Logs
          </button>
        </div>
      </div>
    </aside>
  );
};
