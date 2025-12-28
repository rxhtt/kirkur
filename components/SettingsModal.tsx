
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stack = [
    { name: "Gemini 3 Pro", provider: "DeepMind", status: "Active", key: "PRO_1..PRO_3" },
    { name: "OpenAI GPT-4o", provider: "OpenAI Core", status: "Linked", key: "sk-proj-qc..." },
    { name: "Groq LPU", provider: "Meta Llama", status: "Ready", key: "gsk_xvc..." },
    { name: "DeepSeek V3", provider: "DeepMind V3", status: "Active", key: "sk-7a86..." },
    { name: "Exa Neural Search", provider: "OSINT Hub", status: "Syncing", key: "f64adfd8..." },
    { name: "Google Maps v2", provider: "Maps Platform", status: "Grounded", key: "AIzaSyDzw..." },
    { name: "YouTube Data v3", provider: "Media Index", status: "Ready", key: "AIzaSyAuC..." },
    { name: "Telegram Bot", provider: "Message Bridge", status: "Active", key: "816547..." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-700">
      <div className="bg-[#1c1c1e] w-full max-w-2xl md:rounded-[3.5rem] rounded-t-[3.5rem] border-t md:border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(255,59,48,0.1)]">
        <div className="flex items-center justify-between p-12 border-b border-white/5">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter italic italic">KERNEL CONFIG</h2>
            <div className="flex items-center gap-3 mt-3">
               <span className="px-2.5 py-1 bg-red-600 text-[9px] font-black text-white rounded-lg uppercase tracking-widest">Master Admin</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Omni-Key Protocol Active</p>
            </div>
          </div>
          <button onClick={onClose} className="p-5 bg-white/5 hover:bg-red-600/20 rounded-full transition-all hover:scale-110 active:scale-90 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="group-hover:stroke-red-500"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="p-12 space-y-12 max-h-[60vh] overflow-y-auto no-scrollbar">
          <section>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.5em]">Neural Infrastructure</h3>
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">All Ports Secure</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stack.map(item => (
                <div key={item.name} className="p-7 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-red-600/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter opacity-60 group-hover:opacity-100">{item.status}</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                      <div className="w-1 h-1 rounded-full bg-emerald-500 opacity-50"></div>
                    </div>
                  </div>
                  <p className="text-base font-black text-white tracking-tight relative z-10">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 opacity-50 font-mono relative z-10">{item.key}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.5em] mb-8">System Environment</h3>
             <div className="space-y-4 p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                {[
                  { label: "Firebase App ID", val: "acscentid-a002d" },
                  { label: "Appwrite Project", val: "687fa293..." },
                  { label: "Weather Uplink", val: "fab96973..." },
                  { label: "Telegram Tunnel", val: "-1001234..." }
                ].map(env => (
                  <div key={env.label} className="flex justify-between items-center group">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest group-hover:text-gray-400 transition-colors">{env.label}</span>
                    <span className="text-[10px] text-white font-mono opacity-40 group-hover:opacity-100 transition-opacity">{env.val}</span>
                  </div>
                ))}
             </div>
          </section>

          <section className="bg-red-600/10 p-10 rounded-[3rem] border border-red-600/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
            <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.5em] mb-8 relative z-10">Neural Persona</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 relative z-10">
              {['Kore (Seductive)', 'Puck (Lethal)', 'Zephyr (Cold)', 'Charon (Ghost)'].map((v, i) => (
                <button key={v} className={`px-10 py-5 rounded-[1.8rem] border text-[11px] font-black whitespace-nowrap transition-all ${i === 0 ? 'bg-white text-black border-white shadow-xl shadow-white/10 scale-105' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-10 leading-relaxed font-bold uppercase tracking-widest text-center opacity-40 relative z-10">
               Authorized by Root // Morrigan Apex Protocol v6.9.0
            </p>
          </section>
        </div>

        <div className="p-12 bg-black/60 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full py-7 bg-white text-black font-black rounded-[2.5rem] hover:bg-gray-200 transition-all text-xs uppercase tracking-[0.6em] shadow-4xl hover:scale-[1.01] active:scale-[0.99]"
          >
            Apply Core Changes
          </button>
        </div>
      </div>
    </div>
  );
};
