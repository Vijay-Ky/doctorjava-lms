'use client';
import Link from 'next/link';
import QuestionEditor from '@/components/admin/practice/QuestionEditor';
export default function NewQuestionPage(){return <div className="min-h-screen bg-surface px-5 py-8 md:px-8"><div className="mx-auto max-w-6xl"><Link href="/admin/question-bank" className="text-xs font-semibold text-muted hover:text-purple">← Question Bank</Link><QuestionEditor/></div></div>}
