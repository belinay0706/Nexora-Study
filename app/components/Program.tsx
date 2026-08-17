'use client';

import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

const days = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

type Schedule = {
  [key: string]: string[];
};

const emptySchedule: Schedule = {
  Pazartesi: [],
  Salı: [],
  Çarşamba: [],
  Perşembe: [],
  Cuma: [],
  Cumartesi: [],
  Pazar: [],
};

export default function Program() {
  const [user, setUser] = useState<User | null>(null);

  const [selectedDay, setSelectedDay] =
    useState('Pazartesi');

  const [schedule, setSchedule] =
    useState<Schedule>(emptySchedule);

  const [newLesson, setNewLesson] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ------------------------------------------------------------
  // FIREBASE'DEN PROGRAMI YÜKLE
  // ------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setSchedule(emptySchedule);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError('');

          const userRef = doc(
            db,
            'users',
            firebaseUser.uid
          );

          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();

            if (data.schedule) {
              setSchedule({
                ...emptySchedule,
                ...data.schedule,
              });
            } else {
              setSchedule(emptySchedule);
            }
          } else {
            setSchedule(emptySchedule);
          }
        } catch (err) {
          console.error(
            'Program Firebase üzerinden okunamadı:',
            err
          );

          setError(
            'Program verileri Firebase üzerinden okunamadı.'
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------
  // FIREBASE'E PROGRAMI KAYDET
  // ------------------------------------------------------------

  const saveSchedule = async (
    updatedSchedule: Schedule
  ) => {
    if (!user) {
      setError(
        'Programı kaydetmek için giriş yapmalısın.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const userRef = doc(
        db,
        'users',
        user.uid
      );

      await setDoc(
        userRef,
        {
          schedule: updatedSchedule,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSchedule(updatedSchedule);
    } catch (err) {
      console.error(
        'Program Firebase kaydı başarısız:',
        err
      );

      setError(
        'Program kaydedilemedi. Firebase bağlantısını kontrol et.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // DERS / GÖREV EKLE
  // ------------------------------------------------------------

  const addLesson = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!newLesson.trim()) return;

    if (!user) {
      setError(
        'Program eklemek için giriş yapmalısın.'
      );
      return;
    }

    const updatedSchedule: Schedule = {
      ...schedule,
      [selectedDay]: [
        ...(schedule[selectedDay] || []),
        newLesson.trim(),
      ],
    };

    await saveSchedule(updatedSchedule);

    setNewLesson('');
  };

  // ------------------------------------------------------------
  // YÜKLENİYOR
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />

          <p className="text-sm font-bold text-slate-800">
            Program yükleniyor...
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Firebase verileri kontrol ediliyor.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // GİRİŞ YOK
  // ------------------------------------------------------------

  if (!user) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="text-4xl mb-4">
            🔐
          </div>

          <h2 className="text-xl font-extrabold text-slate-900">
            Haftalık Ders Programım
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Programını kullanmak için giriş yapmalısın.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // SAYFA
  // ------------------------------------------------------------

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">

      {/* Üst Bilgi Kartı */}

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>📅</span>
          Haftalık Ders Programım
        </h1>

        <p className="text-xs text-slate-500 mt-1 font-medium">
          Hangi gün hangi derslere odaklanacağını planla,
          hedeflerini kontrol altında tut.
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

      {/* HATA MESAJI */}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
          <p className="text-sm font-semibold text-rose-700">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* KAYDEDİLİYOR */}

      {saving && (
        <div className="text-xs font-semibold text-teal-600">
          ⏳ Program Firebase'e kaydediliyor...
        </div>
      )}

      {/* Program İçeriği */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Sol 2 Kolon */}

        <div className="md:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">

          <div>

            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">

              <span>
                {selectedDay} Programı
              </span>

              <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                {(schedule[selectedDay] || []).length}{' '}
                Etkinlik
              </span>

            </h2>

            <div className="space-y-3">

              {(schedule[selectedDay] || []).length === 0 ? (

                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Bu gün için henüz ders veya görev eklenmemiş.
                </p>

              ) : (

                (schedule[selectedDay] || []).map(
                  (lesson, index) => (

                    <div
                      key={`${lesson}-${index}`}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-sm font-semibold text-slate-800"
                    >

                      <div className="flex items-center gap-3">

                        <span className="w-2 h-2 rounded-full bg-teal-500" />

                        <span>
                          {lesson}
                        </span>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

        {/* Sağ Kolon */}

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">

          <form
            onSubmit={addLesson}
            className="space-y-4"
          >

            <h2 className="text-base font-bold text-slate-900">
              ➕ Yeni Görev Ekle
            </h2>

            <div>

              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ders veya Çalışma Adı
              </label>

              <input
                key={selectedDay}
                type="text"
                value={newLesson}
                onChange={(e) =>
                  setNewLesson(e.target.value)
                }
                placeholder="Örn: Matematik Soru Çözümü"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />

            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              {saving
                ? 'Kaydediliyor...'
                : 'Programa Ekle'}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}