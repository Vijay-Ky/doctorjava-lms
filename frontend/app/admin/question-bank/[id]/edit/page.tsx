'use client';
import { use } from 'react';
import Link from 'next/link';
import QuestionEditor from '@/components/admin/practice/QuestionEditor';
export default function EditQuestionPage({params}:{params:Promise<{id:string}>}){const {id}=use(params);return <div className="min-h-screen bg-surface px-5 py-8 md:px-8"><div className="mx-auto max-w-6xl"><Link href="/admin/question-bank" className="text-xs font-semibold text-muted hover:text-purple">← Question Bank</Link><QuestionEditor id={Number(id)}/></div></div>}
