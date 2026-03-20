'use client';

import type { Language } from '@kangwon/shared';

interface LanguageSelectorProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSelector({ lang, onChange }: LanguageSelectorProps) {
  const options: { value: Language; label: string }[] = [
    { value: 'ko', label: 'KOR' },
    { value: 'en', label: 'ENG' },
    { value: 'tl', label: 'TGL' },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-full"
         style={{ backgroundColor: 'var(--color-border-light)' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-premium"
          style={lang === opt.value ? {
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text-primary)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          } : {
            backgroundColor: 'transparent',
            color: 'var(--color-text-tertiary)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
