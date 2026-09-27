'use client';

import React, { useState, useEffect } from 'react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  // Hydration hatasını önlemek için istemci tarafında tarihi alıyoruz
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  if (!currentDate) return null; // Yüklenme anı için boş geçiş

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // İçinde bulunulan ayın toplam gün sayısı
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  // Ayın ilk gününün haftanın hangi gününe geldiğini hesaplama (Pazartesi hizalamalı)
  const firstDayIndex = new Date(year, month, 1).getDay();
  const paddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Ay değiştirme fonksiyonları
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Üst Başlık & Kontroller */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🗓️</span> {monthNames[month]} {year} Takvimi
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Çalışma günlerini ve önemli sınav tarihlerini takvim üzerinden takip et.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold"
          >
            ◀ Önceki
          </button>
          <button
            onClick={handleResetToToday}
            className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-200 hover:bg-violet-700 transition-colors"
          >
            Bugün
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold"
          >
            Sonraki ▶
          </button>
        </div>
      </div>

      {/* Takvim Izgarası */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-7 gap-3 text-center">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
            <div key={d} className="font-bold text-xs text-slate-400 py-2">
              {d}
            </div>
          ))}

          {/* Ayın başladığı güne kadar boşluk doldurma */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="h-24 rounded-2xl bg-slate-50/50 border border-transparent" />
          ))}

          {/* Günler */}
          {daysInMonth.map((day) => {
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`h-24 rounded-2xl border p-2 flex flex-col justify-between text-xs font-semibold transition-all ${
                  isToday
                    ? 'bg-violet-50 border-violet-400 text-violet-900 ring-2 ring-violet-500 shadow-md shadow-violet-100'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className={isToday ? 'font-extrabold text-violet-700' : ''}>{day}</span>
                {isToday && (
                  <span className="text-[9px] bg-violet-600 text-white font-bold rounded-md px-1.5 py-0.5 self-start">
                    Bugün
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}