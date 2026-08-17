'use client';

import React, { useMemo, useState } from 'react';

type Badge = {
  id: number;
  title: string;
  desc: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  target?: number;
};

export default function Badges() {
  /*
   * Şimdilik örnek ilerleme değerleri kullanıyoruz.
   *
   * Goal sistemini Firebase'e bağladığımızda bu değerleri:
   * - tamamlanan hedef sayısı
   * - günlük seri
   * - çalışma günleri
   * - Pomodoro oturumları
   * - ders çalışma sayıları
   *
   * üzerinden otomatik hesaplayacağız.
   */

  const [badges] = useState<Badge[]>([
    // ---------------------------------------------------------
    // BAŞLANGIÇ
    // ---------------------------------------------------------
    {
      id: 1,
      title: 'İlk Adım',
      desc: 'Nexora Study ile ilk hedefini tamamla.',
      icon: '🎯',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: true,
      progress: 1,
      target: 1,
    },

    {
      id: 2,
      title: 'İlk Zafer',
      desc: 'İlk günlük hedefini başarıyla tamamla.',
      icon: '🌟',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: true,
      progress: 1,
      target: 1,
    },

    {
      id: 3,
      title: 'Alışkanlık Başlıyor',
      desc: '3 farklı günde hedeflerinden en az birini tamamla.',
      icon: '🌱',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: false,
      progress: 2,
      target: 3,
    },

    // ---------------------------------------------------------
    // SERİ / STREAK
    // ---------------------------------------------------------
    {
      id: 4,
      title: 'Alevi Yak',
      desc: '3 gün üst üste günlük hedeflerinin tamamını bitir.',
      icon: '🔥',
      category: 'Seri',
      rarity: 'rare',
      unlocked: false,
      progress: 2,
      target: 3,
    },

    {
      id: 5,
      title: 'İstikrar Ustası',
      desc: '7 gün boyunca günlük hedeflerini aksatmadan tamamla.',
      icon: '⚡',
      category: 'Seri',
      rarity: 'rare',
      unlocked: false,
      progress: 4,
      target: 7,
    },

    {
      id: 6,
      title: 'Demir İrade',
      desc: '14 günlük kesintisiz hedef tamamlama serisine ulaş.',
      icon: '🛡️',
      category: 'Seri',
      rarity: 'epic',
      unlocked: false,
      progress: 4,
      target: 14,
    },

    {
      id: 7,
      title: 'Zinciri Kırma',
      desc: '30 gün boyunca hedeflerini tamamlamaya devam et.',
      icon: '⛓️',
      category: 'Seri',
      rarity: 'epic',
      unlocked: false,
      progress: 4,
      target: 30,
    },

    {
      id: 8,
      title: 'Efsanevi Seri',
      desc: '100 günlük kesintisiz başarı serisine ulaş.',
      icon: '👑',
      category: 'Seri',
      rarity: 'legendary',
      unlocked: false,
      progress: 4,
      target: 100,
    },

    // ---------------------------------------------------------
    // HEDEFLER
    // ---------------------------------------------------------
    {
      id: 9,
      title: 'Hedef Avcısı',
      desc: 'Toplam 10 hedef tamamla.',
      icon: '🏹',
      category: 'Hedefler',
      rarity: 'common',
      unlocked: false,
      progress: 6,
      target: 10,
    },

    {
      id: 10,
      title: 'Hedef Ustası',
      desc: 'Toplam 50 hedef tamamla.',
      icon: '🎯',
      category: 'Hedefler',
      rarity: 'rare',
      unlocked: false,
      progress: 6,
      target: 50,
    },

    {
      id: 11,
      title: 'Zirveye Doğru',
      desc: '100 hedefi başarıyla tamamla.',
      icon: '🏆',
      category: 'Hedefler',
      rarity: 'epic',
      unlocked: false,
      progress: 6,
      target: 100,
    },

    {
      id: 12,
      title: 'Hedeflerin Efendisi',
      desc: '500 hedef tamamlayarak büyük bir kilometre taşına ulaş.',
      icon: '💎',
      category: 'Hedefler',
      rarity: 'legendary',
      unlocked: false,
      progress: 6,
      target: 500,
    },

    // ---------------------------------------------------------
    // ÇALIŞMA
    // ---------------------------------------------------------
    {
      id: 13,
      title: 'Çalışma Modu',
      desc: 'İlk çalışma oturumunu tamamla.',
      icon: '📚',
      category: 'Çalışma',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      target: 1,
    },

    {
      id: 14,
      title: 'Odaklanmış Zihin',
      desc: '10 çalışma oturumunu tamamla.',
      icon: '🧠',
      category: 'Çalışma',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 10,
    },

    {
      id: 15,
      title: 'Derin Çalışma',
      desc: '50 çalışma oturumunu tamamla.',
      icon: '🔬',
      category: 'Çalışma',
      rarity: 'epic',
      unlocked: false,
      progress: 0,
      target: 50,
    },

    // ---------------------------------------------------------
    // POMODORO
    // ---------------------------------------------------------
    {
      id: 16,
      title: 'İlk Odak',
      desc: 'İlk Pomodoro çalışma seansını tamamla.',
      icon: '🍅',
      category: 'Pomodoro',
      rarity: 'common',
      unlocked: false,
      progress: 0,
      target: 1,
    },

    {
      id: 17,
      title: 'Odak Makinesi',
      desc: '25 Pomodoro seansını tamamla.',
      icon: '⚙️',
      category: 'Pomodoro',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 25,
    },

    {
      id: 18,
      title: 'Zihin Maratonu',
      desc: '100 Pomodoro seansını tamamla.',
      icon: '🏃',
      category: 'Pomodoro',
      rarity: 'epic',
      unlocked: false,
      progress: 0,
      target: 100,
    },

    // ---------------------------------------------------------
    // PLANLAMA
    // ---------------------------------------------------------
    {
      id: 19,
      title: 'Ajanda Üstadı',
      desc: 'Planını 3 gün arka arkaya düzenli şekilde doldur.',
      icon: '📅',
      category: 'Planlama',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 3,
    },

    {
      id: 20,
      title: 'Planlı Öğrenci',
      desc: '7 gün boyunca çalışma planını düzenli kullan.',
      icon: '🗓️',
      category: 'Planlama',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 7,
    },

    // ---------------------------------------------------------
    // NOTLAR
    // ---------------------------------------------------------
    {
      id: 21,
      title: 'Hızlı Kalem',
      desc: 'İlk hızlı notunu oluştur.',
      icon: '✍️',
      category: 'Notlar',
      rarity: 'common',
      unlocked: true,
      progress: 1,
      target: 1,
    },

    {
      id: 22,
      title: 'Bilgi Avcısı',
      desc: '25 faydalı not oluştur.',
      icon: '🔎',
      category: 'Notlar',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 25,
    },

    // ---------------------------------------------------------
    // SORU ÇÖZME
    // ---------------------------------------------------------
    {
      id: 23,
      title: 'Soru Çözücü',
      desc: '100 soru çözdüğünü kaydet.',
      icon: '📝',
      category: 'Sorular',
      rarity: 'rare',
      unlocked: false,
      progress: 0,
      target: 100,
    },

    {
      id: 24,
      title: 'Soru Ustası',
      desc: '500 soru çöz.',
      icon: '🧩',
      category: 'Sorular',
      rarity: 'epic',
      unlocked: false,
      progress: 0,
      target: 500,
    },

    {
      id: 25,
      title: 'Sınav Canavarı',
      desc: '1000 soru çözerek büyük bir kilometre taşına ulaş.',
      icon: '👹',
      category: 'Sorular',
      rarity: 'legendary',
      unlocked: false,
      progress: 0,
      target: 1000,
    },

    // ---------------------------------------------------------
    // ÖZEL
    // ---------------------------------------------------------
    {
      id: 26,
      title: 'Gece Kuşu',
      desc: 'Geç saatlerde bir çalışma hedefini tamamla.',
      icon: '🦉',
      category: 'Özel',
      rarity: 'rare',
      unlocked: false,
    },

    {
      id: 27,
      title: 'Sabah Savaşçısı',
      desc: 'Sabah erken saatlerde ilk hedefini tamamla.',
      icon: '🌅',
      category: 'Özel',
      rarity: 'rare',
      unlocked: false,
    },

    {
      id: 28,
      title: 'Pes Etmeyen',
      desc: 'Zor bir günün ardından ertesi gün tekrar çalışmaya dön.',
      icon: '💪',
      category: 'Özel',
      rarity: 'epic',
      unlocked: false,
    },

    {
      id: 29,
      title: 'Ajan Üstadı',
      desc: 'Uzun vadeli çalışma serisini koruyarak istikrarını kanıtla.',
      icon: '🕵️',
      category: 'Özel',
      rarity: 'legendary',
      unlocked: false,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = useMemo(() => {
    return [
      'Tümü',
      ...Array.from(new Set(badges.map((badge) => badge.category))),
    ];
  }, [badges]);

  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'Tümü') {
      return badges;
    }

    return badges.filter(
      (badge) => badge.category === selectedCategory
    );
  }, [badges, selectedCategory]);

  const unlockedCount = badges.filter(
    (badge) => badge.unlocked
  ).length;

  const completionPercentage = Math.round(
    (unlockedCount / badges.length) * 100
  );

  const getRarityLabel = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'Yaygın';
      case 'rare':
        return 'Nadir';
      case 'epic':
        return 'Destansı';
      case 'legendary':
        return 'Efsanevi';
    }
  };

  const getRarityClass = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-slate-800 text-slate-300 border-slate-700';

      case 'rare':
        return 'bg-blue-950/60 text-blue-300 border-blue-800';

      case 'epic':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';

      case 'legendary':
        return 'bg-amber-950/60 text-amber-300 border-amber-700';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">

      {/* ---------------------------------------------------------
          ÜST PANEL
      --------------------------------------------------------- */}

      <div className="bg-slate-900/70 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏆</span>

              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Rozet & Başarı Koleksiyonum
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Hedeflerini tamamla, serini koru ve yeni başarıların
                  kilidini aç.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="bg-teal-500/10 border border-teal-500/30 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                Kazanılan
              </div>

              <div className="text-xl font-black text-white">
                {unlockedCount}
                <span className="text-slate-500">
                  /{badges.length}
                </span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                İlerleme
              </div>

              <div className="text-xl font-black text-white">
                %{completionPercentage}
              </div>
            </div>

          </div>
        </div>

        {/* Genel ilerleme */}

        <div className="mt-7">

          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
            <span>Rozet koleksiyonu</span>
            <span>
              {unlockedCount} / {badges.length}
            </span>
          </div>

          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">

            <div
              className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 transition-all duration-700"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------
          KATEGORİLER
      --------------------------------------------------------- */}

      <div className="flex gap-2 overflow-x-auto pb-2">

        {categories.map((category) => (

          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold border transition ${
              selectedCategory === category
                ? 'bg-teal-500 text-white border-teal-400'
                : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
            }`}
          >
            {category}
          </button>

        ))}

      </div>

      {/* ---------------------------------------------------------
          ROZETLER
      --------------------------------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredBadges.map((badge) => {

          const progress = badge.progress ?? 0;
          const target = badge.target ?? 0;

          const progressPercentage =
            target > 0
              ? Math.min(
                  100,
                  Math.round((progress / target) * 100)
                )
              : 0;

          return (
            <div
              key={badge.id}
              className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 ${
                badge.unlocked
                  ? 'bg-slate-900/70 border-teal-500/40 shadow-lg shadow-teal-950/20 hover:-translate-y-1'
                  : 'bg-slate-950/50 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >

              {/* Parlaklık */}

              {badge.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/10 blur-3xl rounded-full" />
              )}

              <div className="relative">

                <div className="flex items-start justify-between gap-3">

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${
                      badge.unlocked
                        ? 'bg-slate-800 border-teal-500/30'
                        : 'bg-slate-900 border-slate-800 grayscale'
                    }`}
                  >
                    {badge.unlocked ? badge.icon : '🔒'}
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRarityClass(
                      badge.rarity
                    )}`}
                  >
                    {getRarityLabel(badge.rarity)}
                  </span>

                </div>

                <h3 className="font-bold text-white text-lg mt-5">
                  {badge.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[40px]">
                  {badge.desc}
                </p>

                {/* İlerleme */}

                {!badge.unlocked &&
                  typeof badge.target === 'number' && (
                    <div className="mt-5">

                      <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-2">
                        <span>İlerleme</span>

                        <span>
                          {progress} / {target}
                        </span>
                      </div>

                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all"
                          style={{
                            width: `${progressPercentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  )}

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">

                  <span
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      badge.unlocked
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {badge.unlocked
                      ? 'Kazanıldı ✨'
                      : 'Kilitli 🔒'}
                  </span>

                  {badge.unlocked && (
                    <span className="text-xs">
                      ⭐
                    </span>
                  )}

                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* ---------------------------------------------------------
          MOTİVASYON
      --------------------------------------------------------- */}

      <div className="bg-gradient-to-r from-teal-950/70 via-slate-900/80 to-purple-950/70 border border-teal-900/50 rounded-3xl p-7">

        <div className="flex items-start gap-4">

          <div className="text-3xl">
            🚀
          </div>

          <div>

            <h3 className="text-white font-extrabold">
              Bir sonraki rozetin seni bekliyor.
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Büyük başarılar tek seferde gelmez. Her gün küçük bir
              hedefi tamamlamak, uzun vadede seni çok daha ileri taşır.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}