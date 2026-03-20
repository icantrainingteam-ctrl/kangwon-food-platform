'use client';

import type { Language } from '@kangwon/shared';

interface LanguageSelectorProps {
  lang: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSelector({ lang, onChange }: LanguageSelectorProps) {
  const options: { value: Language; flag: string; label: string }[] = [
    { value: 'ko', flag: '🇰🇷', label: '한국어' },
    { value: 'en', flag: '🇺🇸', label: 'English' },
    { value: 'tl', flag: '🇵🇭', label: 'Tagalog' },
  ];

  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            lang === opt.value
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
          }`}
        >
          {opt.flag} {opt.label}
        </button>
      ))}
    </div>
  );
}
