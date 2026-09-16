import type React from 'react';
import LmsNav from './LmsNav';
export default function PageShell({children}:{children:React.ReactNode}){return <div className="min-h-screen bg-slate-50"><LmsNav/>{children}</div>}
