'use client';

import React from 'react';

interface SettingsProps {
  currentTheme: string;
  setTheme: (theme: string) => void;
}

const themes = [
  { id: 'nexora-gradient', name: 'Nexora Özel', type: 'Özel' },
  { id: 'theme-dark', name: 'Koyu Tema (Dark)', type: 'Koyu' },
  // Koyu Renkler
  { id: 'theme-dark-red', name: 'Koyu Kırmızı', type: 'Koyu' },
  { id: 'theme-dark-orange', name: 'Koyu Turuncu', type: 'Koyu' },
  { id: 'theme-dark-yellow', name: 'Koyu Sarı', type: 'Koyu' },
  { id: 'theme-dark-green', name: 'Koyu Yeşil', type: 'Koyu' },
  { id: 'theme-dark-blue', name: 'Koyu Mavi', type: 'Koyu' },
  { id: 'theme-dark-purple', name: 'Koyu Mor', type: 'Koyu' },
  { id: 'theme-dark-pink', name: 'Koyu Pembe', type: 'Koyu' },
  // Açık Renkler
  { id: 'theme-light-red', name: 'Açık Kırmızı', type: 'Açık' },
  { id: 'theme-light-yellow', name: 'Açık Sarı', type: 'Açık' },
  { id: 'theme-light-green', name: 'Açık Yeşil', type: 'Açık' },
  { id: 'theme-light-blue', name: 'Açık Mavi', type: 'Açık' },
  { id: 'theme-light-purple', name: 'Açık Mor', type: 'Açık' },
  { id: 'theme-light-pink', name: 'Açık Pembe', type: 'Açık' },
];

export default function Settings({ currentTheme, setTheme }: SettingsProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>⚙️</span> Görünüm ve Tema Ayarları
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          İstediğin tüm koyu/açık renk tonlarını ve özel temaları buradan anında seçebilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between shadow-xs ${
              currentTheme === t.id
                ? 'border-teal-500 ring-2 ring-teal-400 bg-white'
                : 'border-slate-200/80 bg-white/80 hover:bg-white'
            }`}
          >
            <div>
              <div className="font-bold text-slate-900 text-sm">{t.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">Tür: {t.type}</div>
            </div>
            <div className={`w-7 h-7 rounded-xl ${t.id} border border-black/10 shadow-inner`}></div>
          </button>
        ))}
      </div>
    </div>
  );
}