import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function PrintPageHeader({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Link
          to="/"
          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all flex items-center justify-center"
          title="الرئيسية"
        >
          <ArrowRight size={22} strokeWidth={2.5} />
        </Link>
        <div className="flex-1 flex items-center justify-center min-w-0">
          <Logo linkToHome={true} size="small" />
        </div>
        <div className="w-10" />
      </div>
      {(title || subtitle) && (
        <div className="max-w-4xl mx-auto mt-4 text-center">
          {title && <h1 className="text-xl font-black text-slate-900">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
