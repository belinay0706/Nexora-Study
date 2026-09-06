'use client';

import React from 'react';

interface SettingsProps {
  currentTheme: string;
  setTheme: (theme: string) => void;
}

const themes = [
  // 🌟 Belora Özel
  { id: 'belora-gradient', name: 'Belora Özel', type: 'Özel', color: 'bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400' },
  
  // 🌙 Koyu Tema
  { id: 'theme-dark', name: 'Koyu Tema (Dark)', type: 'Koyu', color: 'bg-slate-900' },

  // 🔴 Kırmızı
  { id: 'theme-dark-red', name: 'Koyu Kırmızı', type: 'Koyu', color: 'bg-red-800' },
  { id: 'theme-light-red', name: 'Açık Kırmızı', type: 'Açık', color: 'bg-red-100' },

  // 🟠 Turuncu
  { id: 'theme-dark-orange', name: 'Koyu Turuncu', type: 'Koyu', color: 'bg-orange-700' },
  { id: 'theme-light-orange', name: 'Açık Turuncu', type: 'Açık', color: 'bg-orange-100' },

  // 🟡 Sarı
  { id: 'theme-dark-yellow', name: 'Koyu Sarı', type: 'Koyu', color: 'bg-amber-600' },
  { id: 'theme-light-yellow', name: 'Açık Sarı', type: 'Açık', color: 'bg-amber-100' },

  // 🟢 Yeşil
  { id: 'theme-dark-green', name: 'Koyu Yeşil', type: 'Koyu', color: 'bg-emerald-800' },
  { id: 'theme-light-green', name: 'Açık Yeşil', type: 'Açık', color: 'bg-emerald-100' },

  // 🔵 Mavi
  { id: 'theme-dark-blue', name: 'Koyu Mavi', type: 'Koyu', color: 'bg-blue-800' },
  { id: 'theme-light-blue', name: 'Açık Mavi', type: 'Açık', color: 'bg-sky-100' },

  // 🟣 Mor
  { id: 'theme-dark-purple', name: 'Koyu Mor', type: 'Koyu', color: 'bg-purple-800' },
  { id: 'theme-light-purple', name: 'Açık Mor', type: 'Açık', color: 'bg-purple-100' },

  // 🌸 Pembe
  { id: 'theme-dark-pink', name: 'Koyu Pembe', type: 'Koyu', color: 'bg-pink-800' },
  { id: 'theme-light-pink', name: 'Açık Pembe', type: 'Açık', color: 'bg-pink-100' },
];

export default function Settings({ currentTheme, setTheme }: SettingsProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Üst Bilgi Kartı */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>⚙️</span> Görünüm ve Tema Ayarları
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          İstediğin tüm koyu/açık renk tonlarını ve Belora'ya özel temaları buradan anında seçebilirsin.
        </p>
      </div>

      {/* Tema Seçim Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between shadow-xs cursor-pointer ${
              currentTheme === t.id
                ? 'border-teal-500 ring-2 ring-teal-400 bg-white'
                : 'border-slate-200/80 bg-white/80 hover:bg-white'
            }`}
          >
            <div>
              <div className="font-bold text-slate-900 text-sm">{t.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">Tür: {t.type}</div>
            </div>
            {/* Ön İzleme Renk Dairesi */}
            <div className={`w-7 h-7 rounded-xl ${t.color} border border-black/10 shadow-inner flex-shrink-0`}></div>
          </button>
        ))}
      </div>
    </div>
  );
}