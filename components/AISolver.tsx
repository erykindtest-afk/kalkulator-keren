
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { SmartResponse } from '../types';

interface AISolverProps {
  onCalculate: (calc: { expression: string; result: string; type: 'ai' }) => void;
}

const AISolver: React.FC<AISolverProps> = ({ onCalculate }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartResponse | null>(null);

  const solve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Solve this math problem: ${input}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: 'The final numerical result.' },
              steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Step by step solution steps.' },
              explanation: { type: Type.STRING, description: 'Brief human explanation of the solution.' },
            },
            required: ['answer', 'steps', 'explanation'],
          },
        },
      });

      const data: SmartResponse = JSON.parse(response.text || '{}');
      setResult(data);
      onCalculate({
        expression: input,
        result: data.answer,
        type: 'ai',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Natural Language Solver</h2>
        <form onSubmit={solve} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Find the area of a circle with radius 5 plus the root of 64"
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 pr-12 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-32"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 rounded-xl text-white transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>

      {result && (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
            <div className="text-xs font-bold text-blue-400 uppercase mb-1">Final Result</div>
            <div className="text-3xl font-bold text-white tracking-tight">{result.answer}</div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase">Solution Steps</div>
            {result.steps.map((step, i) => (
              <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-green-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Expert Insight</div>
              <p className="text-xs text-slate-400 leading-relaxed italic">{result.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Send size={24} className="text-blue-400" />
          </div>
          <p className="text-sm text-slate-400">Type a math problem and let Gemini Pro solve it for you.</p>
        </div>
      )}
    </div>
  );
};

export default AISolver;
