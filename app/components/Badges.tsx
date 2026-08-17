'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

type PomodoroMode = 'work' | 'break';

export default function Pomodoro() {
  const [user, setUser] = useState<User | null>(null);

  // ------------------------------------------------------------
  // SÜRELER
  // ------------------------------------------------------------

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // ------------------------------------------------------------
  // AKTİF SAYAÇ
  // ------------------------------------------------------------

  const [mode, setMode] = useState<PomodoroMode>('work');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // ------------------------------------------------------------
  // FIREBASE
  // ------------------------------------------------------------

  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sayaç sırasında güncel değerleri korumak için
  const modeRef = useRef<PomodoroMode>('work');
  const workMinutesRef = useRef(25);
  const breakMinutesRef = useRef(5);

  // ------------------------------------------------------------
  // REF DEĞERLERİNİ GÜNCELLE
  // ------------------------------------------------------------

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    workMinutesRef.current = workMinutes;
  }, [workMinutes]);

  useEffect(() => {
    breakMinutesRef.current = breakMinutes;
  }, [breakMinutes]);

  // ------------------------------------------------------------
  // FIREBASE'DEN KULLANICI VERİLERİNİ AL
  // ------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setCompletedPomodoros(0);
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

            const count =
              typeof data.completedPomodoros === 'number'
                ? data.completedPomodoros
                : 0;

            setCompletedPomodoros(count);
          } else {
            setCompletedPomodoros(0);
          }
        } catch (err) {
          console.error(
            'Pomodoro verisi okunamadı:',
            err
          );

          setError(
            'Pomodoro verileri Firebase üzerinden okunamadı.'
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------
  // POMODORO TAMAMLANDIĞINDA FIREBASE'E KAYDET
  // ------------------------------------------------------------

  const completePomodoro = async () => {
    if (!user) {
      setError('Pomodoro kaydetmek için giriş yapmalısın.');
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

      // increment kullanıyoruz.
      // Böylece eski değerin üzerine güvenli şekilde +1 eklenir.
      await setDoc(
        userRef,
        {
          completedPomodoros: increment(1),
          lastPomodoroCompletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      // Ekrandaki sayıyı da hemen güncelle.
      setCompletedPomodoros(
        (current) => current + 1
      );
    } catch (err) {
      console.error(
        'Pomodoro Firebase kaydı başarısız:',
        err
      );

      setError(
        'Pomodoro tamamlandı fakat Firebase kaydedilemedi.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // SAYAÇ
  // ------------------------------------------------------------

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((currentSeconds) => {
        if (currentSeconds > 0) {
          return currentSeconds - 1;
        }

        setMinutes((currentMinutes) => {
          if (currentMinutes > 0) {
            return currentMinutes - 1;
          }

          return 0;
        });

        return 59;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isActive]);

  // ------------------------------------------------------------
  // SAYAÇ 00:00 OLDUĞUNDA
  // ------------------------------------------------------------

  useEffect(() => {
    if (
      !isActive ||
      minutes !== 0 ||
      seconds !== 0
    ) {
      return;
    }

    const finish = async () => {
      setIsActive(false);

      // --------------------------------------------------------
      // ÇALIŞMA BİTTİ
      // --------------------------------------------------------

      if (modeRef.current === 'work') {
        await completePomodoro();

        alert(
          '🎉 Pomodoro tamamlandı! Harika odaklandın. Şimdi mola zamanı.'
        );

        setMode('break');
        setMinutes(breakMinutesRef.current);
        setSeconds(0);

        return;
      }

      // --------------------------------------------------------
      // MOLA BİTTİ
      // --------------------------------------------------------

      alert(
        '☕ Mola tamamlandı! Hazırsan yeni çalışma seansına başlayabilirsin.'
      );

      setMode('work');
      setMinutes(workMinutesRef.current);
      setSeconds(0);
    };

    finish();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, seconds, isActive]);

  // ------------------------------------------------------------
  // ÇALIŞMA SÜRESİNİ DEĞİŞTİR
  // ------------------------------------------------------------

  const updateWorkMinutes = (value: number) => {
    if (isActive) return;

    const safeValue = Math.min(
      120,
      Math.max(1, value || 1)
    );

    setWorkMinutes(safeValue);
    workMinutesRef.current = safeValue;

    if (mode === 'work') {
      setMinutes(safeValue);
      setSeconds(0);
    }
  };

  // ------------------------------------------------------------
  // MOLA SÜRESİNİ DEĞİŞTİR
  // ------------------------------------------------------------

  const updateBreakMinutes = (value: number) => {
    if (isActive) return;

    const safeValue = Math.min(
      60,
      Math.max(1, value || 1)
    );

    setBreakMinutes(safeValue);
    breakMinutesRef.current = safeValue;

    if (mode === 'break') {
      setMinutes(safeValue);
      setSeconds(0);
    }
  };

  // ------------------------------------------------------------
  // MOD DEĞİŞTİR
  // ------------------------------------------------------------

  const changeMode = (nextMode: PomodoroMode) => {
    if (isActive) return;

    setMode(nextMode);
    modeRef.current = nextMode;

    if (nextMode === 'work') {
      setMinutes(workMinutes);
    } else {
      setMinutes(breakMinutes);
    }

    setSeconds(0);
  };

  // ------------------------------------------------------------
  // SIFIRLA
  // ------------------------------------------------------------

  const resetTimer = () => {
    setIsActive(false);

    if (mode === 'work') {
      setMinutes(workMinutes);
    } else {
      setMinutes(breakMinutes);
    }

    setSeconds(0);
  };

  // ------------------------------------------------------------
  // YÜKLENİYOR
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl px-8 py-6 text-center shadow-2xl">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-white/10 border-t-teal-400 animate-spin" />

          <p className="text-sm font-semibold text-white">
            Pomodoro yükleniyor...
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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">
            🔐
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Pomodoro
          </h2>

          <p className="text-sm text-slate-400">
            Pomodoro kullanmak için giriş yapmalısın.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // SAYFA
  // ------------------------------------------------------------

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">

      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 text-center max-w-md mx-auto shadow-xl">

        <h2 className="text-2xl font-black text-white mb-2">
          🍅 Pomodoro Odaklanma
        </h2>

        <p className="text-xs text-slate-400 mb-6">
          Çalışma ve mola sürelerini kendin belirle.
        </p>

        {/* MOD */}

        <div className="grid grid-cols-2 gap-2 mb-6">

          <button
            type="button"
            disabled={isActive}
            onClick={() => changeMode('work')}
            className={`py-3 rounded-xl text-sm font-bold transition ${
              mode === 'work'
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            } disabled:opacity-50`}
          >
            📚 Çalışma
          </button>

          <button
            type="button"
            disabled={isActive}
            onClick={() => changeMode('break')}
            className={`py-3 rounded-xl text-sm font-bold transition ${
              mode === 'break'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400'
            } disabled:opacity-50`}
          >
            ☕ Mola
          </button>

        </div>

        {/* MOD BAŞLIĞI */}

        <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
          {mode === 'work'
            ? 'Çalışma zamanı'
            : 'Mola zamanı'}
        </div>

        {/* SAYAÇ */}

        <div
          className={`text-6xl font-black mb-6 font-mono tracking-wider ${
            mode === 'work'
              ? 'text-teal-300'
              : 'text-blue-300'
          }`}
        >
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </div>

        {/* SÜRELER */}

        <div className="space-y-3 mb-6">

          <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-3">

            <span className="text-xs font-bold text-slate-400">
              📚 Çalışma süresi
            </span>

            <div className="flex items-center gap-2">

              <input
                type="number"
                min="1"
                max="120"
                value={workMinutes}
                disabled={isActive}
                onChange={(e) =>
                  updateWorkMinutes(
                    Number(e.target.value)
                  )
                }
                className="w-16 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-center font-bold text-sm focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />

              <span className="text-xs text-slate-500">
                dk
              </span>

            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-3">

            <span className="text-xs font-bold text-slate-400">
              ☕ Mola süresi
            </span>

            <div className="flex items-center gap-2">

              <input
                type="number"
                min="1"
                max="60"
                value={breakMinutes}
                disabled={isActive}
                onChange={(e) =>
                  updateBreakMinutes(
                    Number(e.target.value)
                  )
                }
                className="w-16 px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-center font-bold text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />

              <span className="text-xs text-slate-500">
                dk
              </span>

            </div>
          </div>

        </div>

        {/* BUTONLAR */}

        <div className="flex gap-4">

          <button
            type="button"
            disabled={saving}
            onClick={() => setIsActive((current) => !current)}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              isActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : mode === 'work'
                ? 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-lg'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            } disabled:opacity-50`}
          >
            {isActive
              ? 'Durdur ⏸'
              : mode === 'work'
              ? 'Başlat 🚀'
              : 'Molayı Başlat ☕'}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition-all"
          >
            Sıfırla 🔄
          </button>

        </div>

        {/* HATA */}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* KAYDEDİLİYOR */}

        {saving && (
          <p className="text-xs text-blue-300 mt-4">
            ⏳ Pomodoro Firebase'e kaydediliyor...
          </p>
        )}

        {/* İSTATİSTİK */}

        <div className="mt-6 pt-5 border-t border-slate-800">

          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Tamamlanan Pomodoro
          </div>

          <div className="text-2xl font-black text-white mt-1">
            {completedPomodoros}
          </div>

          <div className="text-[10px] text-slate-500 mt-1">
            Tamamlanan çalışma seansların burada tutulur.
          </div>

        </div>

      </div>

    </div>
  );
}