
import React, { useState } from 'react';

interface CalculatorProps {
  onCalculate: (calc: { expression: string; result: string; type: 'manual' }) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleInput = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const calculate = () => {
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      const resultStr = String(Number.isFinite(result) ? Number(result.toFixed(8)) : 'Error');
      
      onCalculate({
        expression: display,
        result: resultStr,
        type: 'manual',
      });

      setExpression(display + ' =');
      setDisplay(resultStr);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const buttons = [
    { label: 'C', action: clear, type: 'special' },
    { label: 'DEL', action: deleteLast, type: 'special' },
    { label: '%', action: () => handleInput('%'), type: 'op' },
    { label: '÷', action: () => handleInput('/'), type: 'op' },
    { label: '7', action: () => handleInput('7'), type: 'num' },
    { label: '8', action: () => handleInput('8'), type: 'num' },
    { label: '9', action: () => handleInput('9'), type: 'num' },
    { label: '×', action: () => handleInput('*'), type: 'op' },
    { label: '4', action: () => handleInput('4'), type: 'num' },
    { label: '5', action: () => handleInput('5'), type: 'num' },
    { label: '6', action: () => handleInput('6'), type: 'num' },
    { label: '-', action: () => handleInput('-'), type: 'op' },
    { label: '1', action: () => handleInput('1'), type: 'num' },
    { label: '2', action: () => handleInput('2'), type: 'num' },
    { label: '3', action: () => handleInput('3'), type: 'num' },
    { label: '+', action: () => handleInput('+'), type: 'op' },
    { label: '0', action: () => handleInput('0'), type: 'num', wide: true },
    { label: '.', action: () => handleInput('.'), type: 'num' },
    { label: '=', action: calculate, type: 'equals' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col items-end justify-center min-h-[160px] shadow-inner">
        <div className="text-slate-500 text-sm font-medium mb-1 h-6">{expression}</div>
        <div className="text-4xl font-bold tracking-tighter text-white break-all overflow-hidden text-right w-full">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`
              ${btn.wide ? 'col-span-2' : ''}
              ${btn.type === 'special' ? 'bg-slate-700/50 hover:bg-slate-700 text-red-400' : ''}
              ${btn.type === 'op' ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10' : ''}
              ${btn.type === 'num' ? 'bg-white/5 hover:bg-white/10 text-slate-200' : ''}
              ${btn.type === 'equals' ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20' : ''}
              h-full min-h-[64px] rounded-xl flex items-center justify-center text-lg font-semibold transition-all active:scale-95
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
