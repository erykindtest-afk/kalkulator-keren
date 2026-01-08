
import React from 'react';
import { Calculation } from '../types';
import { Trash2, Brain, Calculator as CalcIcon, Clock } from 'lucide-react';

interface HistoryProps {
  history: Calculation[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full text-slate-400">{history.length} Saved</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8">
            <Clock size={48} className="mb-4" />
            <p className="text-sm">No recent calculations. Start crunching some numbers!</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/[0.07] transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${item.type === 'ai' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {item.type === 'ai' ? <Brain size={14} /> : <CalcIcon size={14} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.type === 'ai' ? 'AI Solver' : 'Manual'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-1 line-clamp-2">{item.expression}</div>
              <div className="text-xl font-bold text-white tracking-tight">{item.result}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
