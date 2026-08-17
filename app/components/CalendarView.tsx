'use client';

import React from 'react';

export default function CalendarView() {
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>🗓️</span> Aylık Takvim Görünümü
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Çalışma günlerini ve önemli sınav tarihlerini takvim üzerinden takip et.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-7 gap-3 text-center">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
            <div key={d} className="font-bold text-xs text-slate-400 py-2">{d}</div>
          ))}
          {daysInMonth.map((day) => (
            <div
              key={day}
              className={`h-24 rounded-2xl border p-2 flex flex-col justify-between text-xs font-semibold ${
                day === 6 ? 'bg-teal-50 border-teal-300 text-teal-900 ring-2 ring-teal-400' : 'bg-white border-slate-200/80 text-slate-700'
              }`}
            >
              <span>{day}</span>
              {day === 6 && <span className="text-[9px] bg-teal-500 text-white rounded-md px-1 py-0.5">Bugün</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}