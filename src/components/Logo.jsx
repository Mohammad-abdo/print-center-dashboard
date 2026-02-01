import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '', size = 'default', linkToHome = true }) => {
  const textSize = size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl';
  const iconSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;

  const content = (
    <div className={`flex items-center gap-2 ${className}`} dir="ltr">
      <div
        className="flex items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/30"
        style={{ width: iconSize + 8, height: iconSize + 8 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </div>
      <span
        className={`font-black text-slate-900 ${textSize} tracking-tight`}
        style={{
          fontFamily: '"Arial Black", Arial, sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        Studify
      </span>
      <span className={`font-black text-teal-600 ${textSize}`} style={{ fontFamily: 'inherit' }}>
        Print
      </span>
    </div>
  );

  if (linkToHome) {
    return <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">{content}</Link>;
  }
  return content;
};

export default Logo;
