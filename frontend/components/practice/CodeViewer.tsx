'use client';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function CodeViewer({ code, language = 'java' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const copy = async () => { await navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1020] shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#11182d] px-4 py-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-3"><span className="font-semibold uppercase tracking-wider text-white">{language}</span><span className="text-slate-500">Read-only</span></div>
        <button onClick={copy} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Copy code">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
      </div>
      <div className="overflow-auto p-3 text-[13px] leading-6 font-mono text-slate-200">
        {lines.map((line, i) => <div key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)]"><span className="select-none pr-3 text-right text-slate-600">{i + 1}</span><span className="whitespace-pre">{line || ' '}</span></div>)}
      </div>
    </div>
  );
}
