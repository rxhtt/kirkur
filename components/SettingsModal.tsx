
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stack = [
    { name: "Gemini 3 Pro", provider: "DeepMind", status: "Active", key: "PRO_ELITE_UPLINK" },
    { name: "OpenAI GPT-4o", provider: "OpenAI Core", status: "Linked", key: "sk-proj-qc..." },
    { name: "Groq LPU", provider: "Meta Llama", status: "Ready", key: "gsk_xvc..." },
    { name: "DeepSeek V3", provider: "DeepMind V3", status: "Active", key: "sk-7a86..." },
    { name: "Exa Neural", provider: "OSINT Hub", status: "Syncing", key: "f64adfd8..." },
    { name: "Google Maps", provider: "Maps Platform", status: "Grounded", key: "AIzaSyDzw..." },
    { name: "YouTube Data", provider: "Media Index", status: "Ready", key: "AIzaSyAuC..." },
    { name: "Global Weather", provider: "Sat Link", status: "Active", key: "fab969..." }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-700">
      <div className="glass w-full max-w-4xl md:rounded-[4rem] rounded-t-[4rem] border border-white/10 overflow-hidden shadow-[0_0_150px_rgba(255,59,48,0.1)] flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]">
        <div className="flex items-center justify-between p-12 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl premium-glow rotate-2">
               <span className="text-3xl font-black italic">M</span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">System Core</h2>
              <div className="flex items-center gap-3 mt-2">
                 <span className="px-3 py-1 bg-red-600 text-[9px] font-black text-white rounded-lg uppercase tracking-widest">Root Admin</span>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] font-mono">Kernel.Morrigan.6.9.0</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-6 bg-white/5 hover:bg-red-600/20 rounded-full transition-all group">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="group-hover:stroke-red-500"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-12 space-y-16">
          <section>
            <div className="flex items-center justify-between mb-10 px-4">
              <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.6em]">Neural Infrastructure</h3>
              <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-white/40"></div>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stack.map(item => (
                <div key={item.name} className="p-8 rounded-[2.8rem] bg-white/5 border border-white/5 hover:border-red-600/40 transition-all group relative overflow-hidden cursor-default">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-lg">{item.status}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                  </div>
                  <p className="text-lg font-black text-white tracking-tight relative z-10 italic">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 opacity-40 font-mono relative z-10">{item.key}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h3 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.6em] mb-10 px-4">Uplink Protocols</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                {[
                  { label: "Quantum Tunneling", status: "Active" },
                  { label: "Zero-Knowledge Logs", status: "Enabled" },
                  { label: "Satellite Relay", status: "Synchronized" },
                  { label: "IP Masking", status: "Encrypted" }
                ].map(p => (
                  <div key={p.label} className="flex justify-between items-center p-6 bg-black/40 rounded-[2rem] border border-white/5 group hover:border-white/20 transition-all">
                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">{p.label}</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.3em] font-mono">{p.status}</span>
                  </div>
                ))}
             </div>
          </section>

          <section className="bg-red-600/10 p-12 rounded-[4rem] border border-red-600/20 relative overflow-hidden group mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
            <h3 className="text-[12px] font-black text-red-500 uppercase tracking-[0.6em] mb-10 relative z-10 italic">Core Persona: Morrigan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {['Seductive', 'Lethal', 'Cold', 'Ghost'].map((v, i) => (
                <button key={v} className={`px-6 py-6 rounded-[2rem] border text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-widest ${i === 0 ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-12 leading-relaxed font-bold uppercase tracking-[0.4em] text-center opacity-60 relative z-10">
               Morrigan Apex Protocol // Distributed via encrypted shards.
            </p>
          </section>
        </div>

        <div className="p-12 bg-white/5 border-t border-white/5 backdrop-blur-3xl">
          <button 
            onClick={onClose}
            className="w-full py-8 bg-white text-black font-black rounded-[2.5rem] hover:bg-gray-200 transition-all text-[11px] uppercase tracking-[0.8em] shadow-4xl hover:scale-[1.01] active:scale-[0.99] italic"
          >
            Deploy Kernel Changes
          </button>
        </div>
      </div>
    </div>
  );
};
