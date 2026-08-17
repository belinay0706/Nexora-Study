'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Pomodoro() {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Sadece seansı kaydeden temiz fonksiyon (Hata riski sıfır)
  const savePomodoroSession = async (completedMinutes: number) => {
    try {
      await addDoc(collection(db, 'pomodoroSessions'), {
        duration: completedMinutes,
        createdAt: serverTimestamp(),
      });
      console.log('Pomodoro Firebase’e başarıyla kaydedildi! 🚀');
    } catch (error) {
      console.error('Kayıt hatası: ', error);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          savePomodoroSession(initialMinutes);
          alert('Süre bitti! Harika odaklandın 🎉');
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, initialMinutes]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 text-center max-w-md mx-auto shadow-xl">
        <h2 className="text-2xl font-black text-white mb-2">🍅 Pomodoro Odaklanma</h2>
        <p className="text-xs text-slate-400 mb-6">Süreni kendin belirle, odaklan ve kaydet.</p>

        {/* Sayaç Ekranı */}
        <div className="text-6xl font-black text-teal-300 mb-6 font-mono tracking-wider">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Süre Seçimi */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-400">Süre Seç (Dakika):</span>
          <input 
            type="number" 
            min="1" 
            max="120"
            value={initialMinutes} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setInitialMinutes(val);
              setMinutes(val);
              setSeconds(0);
              setIsActive(false);
            }} 
            className="w-16 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-center font-bold text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-4">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${isActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-lg'}`}
          >
            {isActive ? 'Durdur ⏸' : 'Başlat 🚀'}
          </button>
          <button 
            onClick={() => { 
              setIsActive(false); 
              setMinutes(initialMinutes); 
              setSeconds(0); 
            }}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition-all cursor-pointer"
          >
            Sıfırla 🔄
          </button>
        </div>
      </div>
    </div>
  );
}