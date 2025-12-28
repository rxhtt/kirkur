
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-8 duration-700`}>
      <div className={`
        relative px-8 py-6 rounded-[2.5rem] max-w-[92%] md:max-w-[85%] text-[15px] font-medium leading-relaxed tracking-tight
        ${isAssistant 
          ? 'bg-[#1c1c1e] text-white border border-white/5 shadow-2xl backdrop-blur-3xl' 
          : 'bg-red-600 text-white shadow-3xl shadow-red-600/30'}
      `}>
        {isAssistant && (
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_red]"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Operative Synthesis</span>
             </div>
             <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">Target: Root</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words selection:bg-white/20 selection:text-white">
          {message.content}
        </div>

        {message.media && (
          <div className="mt-6 rounded-3xl overflow-hidden border border-white/10 shadow-3xl group">
             {message.media.type === 'image' ? (
                <img src={message.media.url} alt="Payload" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
             ) : (
                <video src={message.media.url} controls className="w-full h-auto" />
             )}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 px-6">
        <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        {isAssistant && (
           <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
              <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
           </div>
        )}
      </div>
    </div>
  );
};
