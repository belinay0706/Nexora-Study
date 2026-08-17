'use client';

import React, { useState } from 'react';

const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function Program() {
  const [selectedDay, setSelectedDay] = useState('Pazartesi');
  const [schedule, setSchedule] = useState<{ [key: string]: string[] }>({
    Pazartesi: ['Matematik - Türev Çalışması (09:00)', 'Fizik - Vektörler (14:00)'],
    Salı: ['Paragraf Çözümü (10:00)', 'Kimya - Mol Kavramı (15:00)'],
    Çarşamba: ['Geometri - Üçgenler (11:00)'],
    Perşembe: ['İspanyolca Pratik (13:00)', 'Biyoloji - Hücre (16:00)'],
    Cuma: ['Türkçe Deneme Sınavı (10:00)'],
    Cumartesi: ['Genel Tekrar ve Soru Çözümü (14:00)'],
    Pazar: ['Dinlenme ve Planlama (20:00)'],
  });

  const [newLesson, setNewLesson] = useState('');

  const addLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.trim()) return;

    setSchedule({
      ...schedule,
      [selectedDay]: [...(schedule[selectedDay] || []), newLesson]
    });
    setNewLesson('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Üst Bilgi Kartı */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>📅</span> Haftalık Ders Programım
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Hangi gün hangi derslere odaklanacağını planla, hedeflerini kontrol altında tut.
        </p>
      </div>

      {/* Gün Seçim Butonları */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-xs ${
              selectedDay === day
                ? 'bg-slate-900 text-white shadow-md scale-105'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/80'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Seçilen Günün Program İçeriği */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sol 2 Kolon: Görev Listesi */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>{selectedDay} Programı</span>
              <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                {(schedule[selectedDay] || []).length} Etkinlik
              </span>
            </h2>

            <div className="space-y-3">
              {(schedule[selectedDay] || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">Bu gün için henüz ders veya görev eklenmemiş.</p>
              ) : (
                (schedule[selectedDay] || []).map((lesson, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-sm font-semibold text-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      <span>{lesson}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Yeni Ders/Görev Ekleme Formu */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <form onSubmit={addLesson} className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">➕ Yeni Görev Ekle</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ders veya Çalışma Adı</label>
              <input
                type="text"
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                placeholder="Örn: Matematik Soru Çözümü"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              Programa Ekle
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}