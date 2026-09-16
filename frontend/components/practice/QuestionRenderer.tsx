'use client';
import { useMemo } from 'react';
import type { PracticeQuestion } from '@/types/practice';
import CodeViewer from './CodeViewer';

export function QuestionRenderer({ question, selected, onSelect, showAnswer = false, correctOptionId }: { question: PracticeQuestion; selected?: number | null; onSelect?: (id: number) => void; showAnswer?: boolean; correctOptionId?: number | null }) {
  const html = useMemo(() => question.questionText || '', [question.questionText]);
  return <div className="space-y-5">
    {html && <div className="prose prose-sm sm:prose-base max-w-none text-charcoal" dangerouslySetInnerHTML={{__html: html}} />}
    {question.type === 'CODE_OUTPUT' && question.codeContent && <CodeViewer code={question.codeContent} language={question.codeLanguage || 'java'} />}
    <div className="space-y-3">
      {question.options.map((option) => {
        const picked = selected === option.id;
        const correct = showAnswer && correctOptionId === option.id;
        return <button key={option.id} type="button" disabled={!onSelect || showAnswer} onClick={() => onSelect?.(option.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${correct ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : picked && showAnswer ? 'border-rose-300 bg-rose-50 text-rose-900' : picked ? 'border-purple bg-purple/5 text-ink ring-4 ring-purple/5' : 'border-ink/10 bg-white text-charcoal hover:border-purple/30 hover:bg-purple/5'}`}>
          <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${picked || correct ? 'border-current' : 'border-ink/10 text-muted'}`}>{option.key}</span>
          <span className="text-sm leading-6" dangerouslySetInnerHTML={{__html: option.text}} />
          {correct && <span className="ml-auto text-xs font-bold text-emerald-700">Correct</span>}
        </button>
      })}
    </div>
  </div>;
}
