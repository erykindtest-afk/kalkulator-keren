
import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import AISolver from './components/AISolver';
import History from './components/History';
import VoiceAssistant from './components/VoiceAssistant';
import { Calculation } from './types';
import { Calculator as CalcIcon, Brain, History as HistoryIcon, Mic } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calc' | 'ai' | 'history' | 'voice'>('calc');
  const [history, setHistory] = useState<Calculation[]>([]);

  const addHistory = (calc: Omit<Calculation, 'id' | 'timestamp'>) => {
    const newCalc: Calculation = {
      ...calc,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setHistory(prev => [newCalc, ...prev].slice(0, 50));
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>

      <div className="w-full max-w-lg h-[800px] glass rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CalcIcon size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SmartAI <span className="text-blue-400">Calc</span></h1>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            v2.5 Hybrid
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative p-6">
          {activeTab === 'calc' && <Calculator onCalculate={addHistory} />}
          {activeTab === 'ai' && <AISolver onCalculate={addHistory} />}
          {activeTab === 'history' && <History history={history} />}
          {activeTab === 'voice' && <VoiceAssistant />}
        </main>

        {/* Navigation Bar */}
        <nav className="p-4 bg-slate-900/50 border-t border-white/5 flex justify-around items-center">
          <NavButton 
            active={activeTab === 'calc'} 
            onClick={() => setActiveTab('calc')} 
            icon={<CalcIcon size={22} />} 
            label="Standard"
          />
          <NavButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<Brain size={22} />} 
            label="Smart"
          />
          <NavButton 
            active={activeTab === 'voice'} 
            onClick={() => setActiveTab('voice')} 
            icon={<Mic size={22} />} 
            label="Voice"
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<HistoryIcon size={22} />} 
            label="History"
          />
        </nav>
      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-blue-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
  </button>
);

export default App;
