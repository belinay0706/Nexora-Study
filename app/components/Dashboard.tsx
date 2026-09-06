'use client';

import React, { useState } from 'react';
import Subjects from './Subjects';

interface DashboardProps {
  selectedLevel: string;
}

export default function Dashboard({ selectedLevel }: DashboardProps) {
  const [badges, setBadges] = useState([
    { id: 1, title: 'İlk Adım', desc: 'Sisteme giriş yaptın ve çalışmaya başladın!', icon: '🎯', unlocked: true },
    { id: 2, title: 'Matematik Canavarı', desc: '5 zorlu soruyu başarıyla kaydettin.', icon: '📐', unlocked: true },
    { id: 3, title: 'Ajanda Üstadı', desc: 'Günlük planını tam 3 gün aralıksız uyguladın.', icon: '📅', unlocked: false },
    { id: 4, title: 'Hızlı Kalem', desc: 'Hızlı notlar sayfasına 10 farklı düşünce ekledin.', icon: '✍️', unlocked: false },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Üst Karşılama ve Motivasyon Kartı (Rozet Sayacı Kaldırıldı) */}
      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-950 text-teal-300 rounded-xl border border-teal-800 uppercase tracking-wider">
            {selectedLevel} Hedefi
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-3">
            Harika gidiyorsun! ✨
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Bugünkü hedeflerini tamamla, yeni rozetler kazan ve dijital ajandanda tasarımlarını yap!
          </p>
        </div>
      </div>

      {/* Ana Modüller Izgarası (Alt Buton Yazıları Kaldırıldı) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Dijital Ajanda Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              📅
            </div>
            <h3 className="font-bold text-white text-lg">Dijital Ajanda & Sticker Defteri</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Günlere ayrılmış ajanda görünümleri, özel stickerlar, renkli kalemler ve esnek yazı stilleri seni bekliyor.
            </p>
          </div>
        </div>

        {/* Yapamadığım Sorular (Soru Kitabı) Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              ❌
            </div>
            <h3 className="font-bold text-white text-lg">Yapamadığım Sorular Kitabı</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Çözemediğin soruların fotoğraflarını yükle, kendi özel soru bankası kitabını oluştur ve sonradan tekrar et.
            </p>
          </div>
        </div>

        {/* Hızlı Notlar Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              📝
            </div>
            <h3 className="font-bold text-white text-lg">Hızlı Notlar & Fikirler</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Aklından geçenleri anında not al, mental offloading yap ve günlük düşüncelerini serbestçe karala.
            </p>
          </div>
        </div>

        {/* Hedefler Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              🎯
            </div>
            <h3 className="font-bold text-white text-lg">Hedefler & Görevler</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Günlük ve haftalık büyük hedeflerini belirle, tamamladıkça rozetleri ve sürpriz ödülleri topla.
            </p>
          </div>
        </div>

        {/* Rozetler ve Başarılar Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              🏆
            </div>
            <h3 className="font-bold text-white text-lg">Rozet Koleksiyonum</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Çalıştıkça açılan özel rozetlerini gör, motivasyonunu artır ve koleksiyonunu tamamla.
            </p>
          </div>
        </div>

        {/* Al Koç (Akıllı Asistan) Kartı */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-2xl flex items-center justify-center text-xl mb-4">
              🤖
            </div>
            <h3 className="font-bold text-white text-lg">Al Koç Rehberlik</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Takıldığın konularda sana özel çalışma programı hazırlayan ve motivasyon veren akıllı koçun.
            </p>
          </div>
        </div>

      </div>

      {/* Subjects Alanı (Sadeleştirilmiş Panel) */}
      <div className="mt-12">
        <Subjects selectedLevel={selectedLevel} />
      </div>

    </div>
  );
}