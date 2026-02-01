import React from 'react';

const currentYear = new Date().getFullYear();

export default function PrintFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-4 px-4 no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <p className="text-xs font-bold text-slate-400">
          © {currentYear} Qeematech. جميع الحقوق محفوظة.
        </p>
        <p className="text-xs text-slate-500" dir="ltr">
          Powered by Studify Print
        </p>
      </div>
    </footer>
  );
}
