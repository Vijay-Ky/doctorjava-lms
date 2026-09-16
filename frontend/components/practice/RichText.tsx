'use client';
import { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Code2 } from 'lucide-react';

export default function RichText({ value, onChange, placeholder = 'Write question...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [active, setActive] = useState(false);
  const apply = (cmd: string) => { document.execCommand(cmd, false); const el = document.getElementById('dj-rich-editor'); if (el) onChange(el.innerHTML); };
  return <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white focus-within:border-purple/40 focus-within:ring-4 focus-within:ring-purple/5">
    <div className="flex flex-wrap gap-1 border-b border-ink/5 bg-surface px-2 py-2">
      {[["bold", Bold],["italic", Italic],["underline", Underline],["insertUnorderedList", List],["insertOrderedList", ListOrdered],["formatBlock", Code2]].map(([cmd, Icon]: any) => <button type="button" key={cmd} onMouseDown={(e) => { e.preventDefault(); apply(cmd); }} className="rounded-lg p-2 text-muted hover:bg-white hover:text-purple"><Icon size={15}/></button>)}
    </div>
    <div id="dj-rich-editor" contentEditable suppressContentEditableWarning onFocus={() => setActive(true)} onBlur={(e) => { setActive(false); onChange(e.currentTarget.innerHTML); }} onInput={(e) => onChange(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html: value}} className={`min-h-28 px-4 py-3 text-sm text-charcoal outline-none prose prose-sm max-w-none ${active ? '' : ''}`} data-placeholder={placeholder}/>
  </div>;
}
