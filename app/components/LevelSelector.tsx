'use client';

import React, { useState } from 'react';

export default function LevelSelector({ onSelectLevel, onBackToLogin }: { onSelectLevel: (level: string) => void, onBackToLogin: () => void }) {
  const [category, setCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold mb-1">Eğitim Seviyeni veya Bölümünü Seç</h1>
          <p className="text-xs text-white/80">Sana en uygun müfredat ve AI Koç deneyimi için kategorini belirle.</p>
        </div>

        {!category ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setCategory('ilkokul')} className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-center transition cursor-pointer">
              <span className="text-2xl block mb-1">🎒</span> İlkokul
            </button>
            <button onClick={() => setCategory('ortaokul')} className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-center transition cursor-pointer">
              <span className="text-2xl block mb-1">📚</span> Ortaokul
            </button>
            <button onClick={() => setCategory('lise')} className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-center transition cursor-pointer">
              <span className="text-2xl block mb-1">🏫</span> Lise / YKS
            </button>
            <button onClick={() => setCategory('universite')} className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-center transition cursor-pointer">
              <span className="text-2xl block mb-1">🎓</span> Üniversite
            </button>
            <button onClick={() => onSelectLevel('KPSS')} className="col-span-2 p-4 bg-teal-600/40 hover:bg-teal-600/60 border border-teal-400/30 rounded-2xl text-center transition cursor-pointer">
              <span className="text-2xl block mb-1">🎯</span> KPSS
            </button>
            <button onClick={onBackToLogin} className="col-span-2 p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-2xl text-center text-xs transition cursor-pointer">
              ← Geri Dön / Çıkış Yap
            </button>
          </div>
        ) : category === 'ilkokul' ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-teal-300">İlkokul Sınıfı Seç:</h2>
            <div className="grid grid-cols-2 gap-3">
              {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map((lvl) => (
                <button key={lvl} onClick={() => onSelectLevel(lvl)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer">{lvl}</button>
              ))}
            </div>
            <button onClick={() => setCategory(null)} className="text-xs text-white/70 underline mt-4 block">← Kategorilere Dön</button>
          </div>
        ) : category === 'ortaokul' ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-teal-300">Ortaokul Sınıfı Seç:</h2>
            <div className="grid grid-cols-3 gap-3">
              {['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf (LGS)'].map((lvl) => (
                <button key={lvl} onClick={() => onSelectLevel(lvl)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer">{lvl}</button>
              ))}
            </div>
            <button onClick={() => setCategory(null)} className="text-xs text-white/70 underline mt-4 block">← Kategorilere Dön</button>
          </div>
        ) : category === 'lise' ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-teal-300">Lise Seviyesi Seç:</h2>
            <div className="grid grid-cols-2 gap-3">
              {['9. Sınıf ', '10. Sınıf ', '11. Sınıf ', '12. Sınıf '].map((lvl) => (
                <button key={lvl} onClick={() => onSelectLevel(lvl)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer">{lvl}</button>
              ))}
            </div>
            <button onClick={() => setCategory(null)} className="text-xs text-white/70 underline mt-4 block">← Kategorilere Dön</button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-teal-300">Üniversite Fakülte / Bölümünü Seç:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {[
                'Bilgisayar Mühendisliği',
                'Elektrik Elektronik Mühendisliği',
                'Endüstri Mühendisliği',
                'İnşaat Mühendisliği',
                'Makine Mühendisliği',
                'Yazılım Mühendisliği',
                'Havacılık ve Uzay Mühendisliği',
                'Tıp Fakültesi',
                'Diş Hekimliği Fakültesi',
                'Hemşirelik Fakültesi'
              ].map((dept) => (
                <button key={dept} onClick={() => onSelectLevel(dept)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium text-left cursor-pointer">
                  🎓 {dept}
                </button>
              ))}
            </div>
            <button onClick={() => setCategory(null)} className="text-xs text-white/70 underline mt-3 block">← Kategorilere Dön</button>
          </div>
        )}
      </div>
    </div>
  );
}