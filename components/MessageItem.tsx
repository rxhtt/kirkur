
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-12 duration-1000 group`}>
      <div className={`
        relative px-10 py-8 rounded-[3.5rem] max-w-[95%] md:max-w-[85%] text-[15px] font-medium leading-relaxed tracking-tight
        ${isAssistant 
          ? 'glass text-white shadow-2xl border-white/10' 
          : 'bg-white text-black shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]'}
      `}>
        {isAssistant && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-600 premium-glow"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Operative Synthesis</span>
             </div>
             <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
             </div>
          </div>
        )}
        
        <div className={`whitespace-pre-wrap break-words selection:bg-red-500/40 ${isAssistant ? 'text-gray-100' : 'text-black font-bold'}`}>
          {message.content}
        </div>

        {message.media && (
          <div className="mt-8 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-4xl group/media transition-transform hover:scale-[1.02] duration-500">
             {message.media.type === 'image' ? (
                <img src={message.media.url} alt="Payload" className="w-full h-auto" />
             ) : (
                <video src={message.media.url} controls className="w-full h-auto" />
             )}
          </div>
        )}
      </div>
      <div className={`mt-4 flex items-center gap-4 px-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest mono">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isAssistant && (
           <div className="flex gap-2">
              <button className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Copy Payload</button>
              <span className="text-gray-800">/</span>
              <button className="text-[9px] font-black text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors">Flag Anomalies</button>
           </div>
        )}
      </div>
    </div>
  );
};
