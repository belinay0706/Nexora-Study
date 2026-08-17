'use client';

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  completedAt?: string | null;
}

interface GoalHistoryDay {
  completed: boolean;
  completedCount: number;
  totalCount: number;
}

interface GoalHistory {
  [date: string]: GoalHistoryDay;
}

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getPreviousDateKey = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00`);

  date.setDate(date.getDate() - 1);

  return getLocalDateKey(date);
};

const calculateStreak = (
  history: GoalHistory,
  currentDateKey: string
) => {
  let streak = 0;
  let cursor = currentDateKey;

  while (
    history[cursor]?.completed === true
  ) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }

  return streak;
};

export default function Goals() {
  const [user, setUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(true);

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [goalHistory, setGoalHistory] =
    useState<GoalHistory>({});

  const [currentStreak, setCurrentStreak] =
    useState(0);

  const [bestStreak, setBestStreak] =
    useState(0);

  const [totalCompletedDays, setTotalCompletedDays] =
    useState(0);

  const [newGoalText, setNewGoalText] =
    useState('');

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState('');

  const [saveSuccess, setSaveSuccess] =
    useState(false);

  const [deletingGoalId, setDeletingGoalId] =
    useState<string | null>(null);

  const todayKey = useMemo(
    () => getLocalDateKey(),
    []
  );

  /*
   * AUTH
   */
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser);
          setAuthLoading(false);

          setGoals([]);
          setGoalHistory({});
          setCurrentStreak(0);
          setBestStreak(0);
          setTotalCompletedDays(0);
          setSaveError('');
          setSaveSuccess(false);

          if (!firebaseUser) {
            setIsLoading(false);
            return;
          }

          await loadGoalData(firebaseUser);
        }
      );

    return () => unsubscribe();
  }, []);

  /*
   * FIREBASE'DEN VERİLERİ YÜKLE
   */
  const loadGoalData = async (
    firebaseUser: User
  ) => {
    setIsLoading(true);
    setSaveError('');

    try {
      const profileRef = doc(
        db,
        'users',
        firebaseUser.uid
      );

      const profileSnap =
        await getDoc(profileRef);

      if (!profileSnap.exists()) {
        setGoals([]);
        setGoalHistory({});
        setCurrentStreak(0);
        setBestStreak(0);
        setTotalCompletedDays(0);

        return;
      }

      const data =
        profileSnap.data();

      const storedGoals =
        Array.isArray(data.goals)
          ? (data.goals as Goal[])
          : [];

      const storedHistory =
        data.goalHistory &&
        typeof data.goalHistory === 'object'
          ? (data.goalHistory as GoalHistory)
          : {};

      const storedCurrentStreak =
        typeof data.currentStreak === 'number'
          ? data.currentStreak
          : 0;

      const storedBestStreak =
        typeof data.bestStreak === 'number'
          ? data.bestStreak
          : 0;

      const storedTotalCompletedDays =
        typeof data.totalCompletedDays === 'number'
          ? data.totalCompletedDays
          : 0;

      setGoals(storedGoals);
      setGoalHistory(storedHistory);

      setCurrentStreak(
        storedCurrentStreak
      );

      setBestStreak(
        storedBestStreak
      );

      setTotalCompletedDays(
        storedTotalCompletedDays
      );
    } catch (error) {
      console.error(
        'Hedefler yüklenemedi:',
        error
      );

      setSaveError(
        'Hedefler yüklenemedi. Firebase bağlantısını kontrol et.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * FIREBASE'E KAYDET
   */
  const saveGoalData = async (
    updatedGoals: Goal[],
    updatedHistory: GoalHistory,
    updatedCurrentStreak: number,
    updatedBestStreak: number,
    updatedTotalCompletedDays: number
  ) => {
    if (!user) {
      return false;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const profileRef = doc(
        db,
        'users',
        user.uid
      );

      await setDoc(
        profileRef,
        {
          goals: updatedGoals,
          goalHistory: updatedHistory,
          currentStreak:
            updatedCurrentStreak,
          bestStreak:
            updatedBestStreak,
          totalCompletedDays:
            updatedTotalCompletedDays,
          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSaveSuccess(true);

      window.setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

      return true;
    } catch (error) {
      console.error(
        'Hedefler kaydedilemedi:',
        error
      );

      setSaveError(
        'Kaydedilemedi. Firebase bağlantısını ve Firestore kurallarını kontrol et.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * BUGÜNÜN HEDEFLERİ
   */
  const todaysGoals = useMemo(() => {
    return goals.filter(
      (goal) =>
        goal.date === todayKey
    );
  }, [goals, todayKey]);

  /*
   * TAMAMLANAN HEDEFLER
   */
  const completedCount = useMemo(() => {
    return todaysGoals.filter(
      (goal) => goal.completed
    ).length;
  }, [todaysGoals]);

  const totalToday =
    todaysGoals.length;

  /*
   * İLERLEME
   */
  const progressPercentage =
    totalToday > 0
      ? Math.round(
          (completedCount /
            totalToday) *
            100
        )
      : 0;

  const allGoalsCompleted =
    totalToday > 0 &&
    completedCount === totalToday;

  /*
   * BUGÜNÜN HISTORY'SİNİ OLUŞTUR
   */
  const buildTodayHistory = (
    updatedGoals: Goal[],
    existingHistory: GoalHistory
  ) => {
    const updatedHistory = {
      ...existingHistory,
    };

    const todayGoals =
      updatedGoals.filter(
        (goal) =>
          goal.date === todayKey
      );

    /*
     * Bugün hiç hedef yoksa
     * history kaydını tamamen kaldır.
     */
    if (todayGoals.length === 0) {
      delete updatedHistory[todayKey];

      return updatedHistory;
    }

    const completedToday =
      todayGoals.filter(
        (goal) => goal.completed
      ).length;

    const totalTodayGoals =
      todayGoals.length;

    const dayCompleted =
      completedToday ===
      totalTodayGoals;

    updatedHistory[todayKey] = {
      completed:
        dayCompleted,

      completedCount:
        completedToday,

      totalCount:
        totalTodayGoals,
    };

    return updatedHistory;
  };

  /*
   * YENİ HEDEF EKLE
   */
  const addGoal = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanText =
      newGoalText.trim();

    if (
      !cleanText ||
      !user ||
      isSaving ||
      deletingGoalId !== null
    ) {
      return;
    }

    const previousGoals = [...goals];

    const previousHistory = {
      ...goalHistory,
    };

    const previousCurrentStreak =
      currentStreak;

    const previousBestStreak =
      bestStreak;

    const previousTotalCompletedDays =
      totalCompletedDays;

    const newGoal: Goal = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      text: cleanText,

      completed: false,

      date: todayKey,

      completedAt: null,
    };

    const updatedGoals = [
      ...goals,
      newGoal,
    ];

    const updatedHistory =
      buildTodayHistory(
        updatedGoals,
        goalHistory
      );

    const calculatedStreak =
      calculateStreak(
        updatedHistory,
        todayKey
      );

    const newBestStreak =
      Math.max(
        bestStreak,
        calculatedStreak
      );

    const newTotalCompletedDays =
      Object.values(
        updatedHistory
      ).filter(
        (day) =>
          day.completed
      ).length;

    /*
     * UI'ı hemen güncelle.
     */
    setGoals(updatedGoals);
    setGoalHistory(updatedHistory);
    setCurrentStreak(calculatedStreak);
    setBestStreak(newBestStreak);
    setTotalCompletedDays(
      newTotalCompletedDays
    );

    setNewGoalText('');

    /*
     * FIREBASE
     */
    const saved =
      await saveGoalData(
        updatedGoals,
        updatedHistory,
        calculatedStreak,
        newBestStreak,
        newTotalCompletedDays
      );

    /*
     * Kayıt başarısızsa geri dön.
     */
    if (!saved) {
      setGoals(previousGoals);
      setGoalHistory(previousHistory);
      setCurrentStreak(
        previousCurrentStreak
      );
      setBestStreak(
        previousBestStreak
      );
      setTotalCompletedDays(
        previousTotalCompletedDays
      );

      setNewGoalText(cleanText);
    }
  };

  /*
   * HEDEFİ TAMAMLA / GERİ AL
   */
  const toggleGoal = async (
    goalId: string
  ) => {
    if (
      !user ||
      isSaving ||
      deletingGoalId !== null
    ) {
      return;
    }

    const previousGoals = [...goals];

    const previousHistory = {
      ...goalHistory,
    };

    const previousCurrentStreak =
      currentStreak;

    const previousBestStreak =
      bestStreak;

    const previousTotalCompletedDays =
      totalCompletedDays;

    const updatedGoals =
      goals.map((goal) => {
        if (
          goal.id !== goalId
        ) {
          return goal;
        }

        const nextCompleted =
          !goal.completed;

        return {
          ...goal,

          completed:
            nextCompleted,

          completedAt:
            nextCompleted
              ? new Date().toISOString()
              : null,
        };
      });

    const updatedHistory =
      buildTodayHistory(
        updatedGoals,
        goalHistory
      );

    const calculatedStreak =
      calculateStreak(
        updatedHistory,
        todayKey
      );

    const newBestStreak =
      Math.max(
        bestStreak,
        calculatedStreak
      );

    const newTotalCompletedDays =
      Object.values(
        updatedHistory
      ).filter(
        (day) =>
          day.completed
      ).length;

    setGoals(updatedGoals);
    setGoalHistory(updatedHistory);
    setCurrentStreak(calculatedStreak);
    setBestStreak(newBestStreak);
    setTotalCompletedDays(
      newTotalCompletedDays
    );

    const saved =
      await saveGoalData(
        updatedGoals,
        updatedHistory,
        calculatedStreak,
        newBestStreak,
        newTotalCompletedDays
      );

    if (!saved) {
      setGoals(previousGoals);
      setGoalHistory(previousHistory);
      setCurrentStreak(
        previousCurrentStreak
      );
      setBestStreak(
        previousBestStreak
      );
      setTotalCompletedDays(
        previousTotalCompletedDays
      );
    }
  };

  /*
   * =====================================================
   * GERÇEK HEDEF SİLME FONKSİYONU
   * =====================================================
   */
  const deleteGoal = async (
    goalId: string
  ) => {
    /*
     * Kullanıcı yoksa işlem yapma.
     */
    if (!user) {
      return;
    }

    /*
     * Başka bir kayıt veya silme işlemi
     * devam ediyorsa yeni işlem başlatma.
     */
    if (
      isSaving ||
      deletingGoalId !== null
    ) {
      return;
    }

    /*
     * Silinecek hedefi bul.
     */
    const goalToDelete =
      goals.find(
        (goal) =>
          goal.id === goalId
      );

    if (!goalToDelete) {
      return;
    }

    /*
     * ONAY
     */
    const confirmed =
      window.confirm(
        `"${goalToDelete.text}" hedefini silmek istediğine emin misin?`
      );

    if (!confirmed) {
      return;
    }

    /*
     * Eski verileri saklıyoruz.
     * Firebase başarısız olursa geri döneceğiz.
     */
    const previousGoals =
      [...goals];

    const previousHistory = {
      ...goalHistory,
    };

    const previousCurrentStreak =
      currentStreak;

    const previousBestStreak =
      bestStreak;

    const previousTotalCompletedDays =
      totalCompletedDays;

    /*
     * Silinen hedefi belirle.
     */
    setDeletingGoalId(goalId);

    setSaveError('');

    setSaveSuccess(false);

    /*
     * HEDEFİ GERÇEKTEN LİSTEDEN ÇIKAR.
     */
    const updatedGoals =
      goals.filter(
        (goal) =>
          goal.id !== goalId
      );

    /*
     * History'yi yeniden hesapla.
     */
    const updatedHistory =
      buildTodayHistory(
        updatedGoals,
        goalHistory
      );

    /*
     * Seri yeniden hesapla.
     */
    const calculatedStreak =
      calculateStreak(
        updatedHistory,
        todayKey
      );

    /*
     * Best streak asla düşmez.
     */
    const newBestStreak =
      Math.max(
        bestStreak,
        calculatedStreak
      );

    /*
     * Tamamlanan günleri yeniden hesapla.
     */
    const newTotalCompletedDays =
      Object.values(
        updatedHistory
      ).filter(
        (day) =>
          day.completed
      ).length;

    /*
     * EKRANDAN ANINDA SİL.
     */
    setGoals(updatedGoals);

    setGoalHistory(
      updatedHistory
    );

    setCurrentStreak(
      calculatedStreak
    );

    setBestStreak(
      newBestStreak
    );

    setTotalCompletedDays(
      newTotalCompletedDays
    );

    /*
     * FIREBASE'E KAYDET.
     */
    const saved =
      await saveGoalData(
        updatedGoals,
        updatedHistory,
        calculatedStreak,
        newBestStreak,
        newTotalCompletedDays
      );

    /*
     * Firebase başarısızsa
     * hedefi geri getir.
     */
    if (!saved) {
      setGoals(previousGoals);

      setGoalHistory(
        previousHistory
      );

      setCurrentStreak(
        previousCurrentStreak
      );

      setBestStreak(
        previousBestStreak
      );

      setTotalCompletedDays(
        previousTotalCompletedDays
      );
    }

    /*
     * Silme işlemi bitti.
     */
    setDeletingGoalId(null);
  };

  /*
   * GÜN TAMAMLANDI MESAJI
   */
  const getDailyCompletionTitle =
    () => {
      if (!allGoalsCompleted) {
        return '';
      }

      if (
        currentStreak <= 1
      ) {
        return '1. Gün Tamamlandı! 🏆';
      }

      return `${currentStreak}. Gün Tamamlandı! 🔥`;
    };

  /*
   * YÜKLENİYOR
   */
  if (
    authLoading ||
    isLoading
  ) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">

        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl px-8 py-6 text-center shadow-2xl">

          <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-white/10 border-t-teal-400 animate-spin" />

          <p className="text-sm font-semibold text-white">
            Hedeflerin yükleniyor...
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Firebase bağlantısı kuruluyor.
          </p>

        </div>

      </div>
    );
  }

  /*
   * GİRİŞ YOK
   */
  if (!user) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">

          <div className="text-4xl mb-4">
            🔐
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Hedefler
          </h2>

          <p className="text-sm text-slate-400">
            Hedeflerini görmek için
            giriş yapmalısın.
          </p>

        </div>

      </div>
    );
  }

  /*
   * =====================================================
   * SAYFA
   * =====================================================
   */
  return (
    <div className="min-h-screen p-6 md:p-8">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* BAŞLIK */}

        <div className="bg-slate-900/60 backdrop-blur-md p-7 rounded-3xl border border-slate-800 shadow-xl">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-950 text-teal-300 border border-teal-800 text-xs font-bold uppercase tracking-wider">
                🎯 Hedef Merkezi
              </span>

              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-3">
                Bugün neyi tamamlayacağız?
              </h1>

              <p className="text-sm text-slate-400 mt-2">
                Hedeflerini yaz, tamamladıkça
                tikle ve serini büyüt.
              </p>

            </div>

            <div className="bg-gradient-to-br from-orange-500/15 to-red-500/10 border border-orange-400/20 rounded-2xl px-5 py-4 min-w-[210px]">

              <div className="text-xs uppercase tracking-wider text-orange-300 font-bold">
                🔥 Günlük Seri
              </div>

              <div className="text-3xl font-black text-white mt-1">
                {currentStreak} gün
              </div>

              <div className="text-[11px] text-slate-400 mt-1">
                En uzun seri:{' '}
                {bestStreak} gün
              </div>

            </div>

          </div>

        </div>

        {/* KAYIT DURUMU */}

        {(isSaving ||
          saveSuccess ||
          saveError) && (

          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              saveError
                ? 'bg-red-500/10 border-red-400/20 text-red-300'
                : saveSuccess
                ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300'
                : 'bg-blue-500/10 border-blue-400/20 text-blue-300'
            }`}
          >

            {isSaving &&
              '⏳ Kaydediliyor...'}

            {!isSaving &&
              saveSuccess &&
              '✓ Başarıyla kaydedildi'}

            {!isSaving &&
              saveError &&
              `⚠️ ${saveError}`}

          </div>

        )}

        {/* İSTATİSTİKLER */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">

            <div className="text-xs text-slate-400 font-semibold">
              Bugünün Hedefleri
            </div>

            <div className="text-2xl font-black text-white mt-1">
              {completedCount}/{totalToday}
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">

            <div className="text-xs text-slate-400 font-semibold">
              Bugünkü İlerleme
            </div>

            <div className="text-2xl font-black text-teal-300 mt-1">
              %{progressPercentage}
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">

            <div className="text-xs text-slate-400 font-semibold">
              Tamamlanan Gün
            </div>

            <div className="text-2xl font-black text-purple-300 mt-1">
              {totalCompletedDays}
            </div>

          </div>

        </div>

        {/* GÜN TAMAMLANDI */}

        {allGoalsCompleted && (

          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-lg">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <div className="text-4xl">
                🏆
              </div>

              <div>

                <h2 className="text-xl font-extrabold text-white">
                  {getDailyCompletionTitle()}
                </h2>

                <p className="text-sm text-emerald-200/80 mt-1">
                  Bugünkü bütün hedeflerini
                  tamamladın.
                  Nexora seninle gurur
                  duyuyor! 🔥
                </p>

              </div>

            </div>

          </div>

        )}

        {/* İLERLEME */}

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">

          <div className="flex justify-between items-center mb-3">

            <div>

              <h2 className="font-extrabold text-white">
                Bugünkü İlerleme
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Hedeflerinin ne kadarını
                tamamladın?
              </p>

            </div>

            <span className="text-lg font-black text-teal-300">
              %{progressPercentage}
            </span>

          </div>

          <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 transition-all duration-500"
              style={{
                width:
                  `${progressPercentage}%`,
              }}
            />

          </div>

        </div>

        {/* YENİ HEDEF */}

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">

          <h2 className="font-extrabold text-white mb-4">
            ➕ Yeni Hedef Ekle
          </h2>

          <form
            onSubmit={addGoal}
            className="flex flex-col sm:flex-row gap-3"
          >

            <input
              type="text"
              value={newGoalText}
              onChange={(event) =>
                setNewGoalText(
                  event.target.value
                )
              }
              placeholder="Örn: 30 matematik sorusu çöz"
              disabled={
                isSaving ||
                deletingGoalId !== null
              }
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                !newGoalText.trim() ||
                isSaving ||
                deletingGoalId !== null
              }
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-extrabold hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving
                ? 'Kaydediliyor...'
                : 'Hedef Ekle'}
            </button>

          </form>

        </div>

        {/* =================================================
            BUGÜNÜN HEDEFLERİ
        ================================================== */}

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="font-extrabold text-white text-xl">
                📋 Bugünün Hedefleri
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Tamamlamak için tikle.
              </p>

            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">
              {completedCount}/{totalToday}
            </span>

          </div>

          {todaysGoals.length === 0 ? (

            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">

              <div className="text-4xl mb-3">
                🎯
              </div>

              <h3 className="text-white font-bold">
                Henüz bugünün hedefi yok.
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Yukarıdan ilk hedefini ekle.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {todaysGoals.map(
                (goal) => (

                  /*
                   * =================================================
                   * TEK HEDEF KARTI
                   *
                   * Burada SADECE:
                   *
                   * 1. ÜSTTE checkbox
                   * 2. ALTTA çöp kutusu butonu
                   *
                   * var.
                   *
                   * Sağ tarafta artık checkbox benzeri
                   * hiçbir ekstra alan YOK.
                   * =================================================
                   */

                  <div
                    key={goal.id}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      goal.completed
                        ? 'bg-emerald-500/10 border-emerald-400/20'
                        : 'bg-slate-950/50 border-slate-800 hover:border-teal-500/40'
                    }`}
                  >

                    {/* HEDEF SATIRI */}

                    <div className="flex items-center gap-4 p-5">

                      {/* TEK CHECKBOX */}

                      <input
                        type="checkbox"
                        checked={
                          goal.completed
                        }
                        disabled={
                          isSaving ||
                          deletingGoalId !== null
                        }
                        onChange={() =>
                          toggleGoal(
                            goal.id
                          )
                        }
                        className="w-6 h-6 shrink-0 accent-teal-500 cursor-pointer disabled:opacity-50"
                        aria-label={
                          `${goal.text} tamamlandı`
                        }
                      />

                      {/* HEDEF METNİ */}

                      <div className="flex-1 min-w-0">

                        <div
                          className={`text-sm font-semibold break-words ${
                            goal.completed
                              ? 'text-slate-500 line-through'
                              : 'text-white'
                          }`}
                        >
                          {goal.text}
                        </div>

                        {goal.completed && (

                          <div className="text-[10px] text-emerald-400 font-bold mt-1">
                            ✓ Tamamlandı
                          </div>

                        )}

                      </div>

                    </div>

                    {/* =================================================
                        SİLME BUTONU
                        ================================================= */}

                    <div className="px-5 pb-5">

                      <button
                        type="button"
                        onClick={() =>
                          deleteGoal(
                            goal.id
                          )
                        }
                        disabled={
                          isSaving ||
                          deletingGoalId !== null
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-bold hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={
                          `Hedefi sil: ${goal.text}`
                        }
                      >

                        <span className="text-lg">
                          🗑️
                        </span>

                        <span>
                          {deletingGoalId ===
                          goal.id
                            ? 'Hedef Siliniyor...'
                            : 'Hedefi Sil'}
                        </span>

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* GEÇMİŞ */}

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">

          <h2 className="font-extrabold text-white text-xl mb-5">
            📅 Günlük Başarı Geçmişi
          </h2>

          {Object.keys(
            goalHistory
          ).length === 0 ? (

            <p className="text-sm text-slate-500">
              Henüz tamamlanan bir gün yok.
            </p>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

              {Object.entries(
                goalHistory
              )
                .sort(
                  (a, b) =>
                    b[0].localeCompare(
                      a[0]
                    )
                )
                .slice(0, 12)
                .map(
                  ([date, day]) => (

                    <div
                      key={date}
                      className={`rounded-2xl p-4 border ${
                        day.completed
                          ? 'bg-emerald-500/10 border-emerald-400/20'
                          : 'bg-red-500/5 border-red-400/10'
                      }`}
                    >

                      <div className="text-[10px] text-slate-500 font-bold">
                        {date}
                      </div>

                      <div className="text-xl mt-2">
                        {day.completed
                          ? '🏆'
                          : '○'}
                      </div>

                      <div className="text-xs text-slate-300 font-bold mt-1">
                        {day.completedCount}/
                        {day.totalCount}
                      </div>

                      <div
                        className={`text-[10px] font-bold mt-1 ${
                          day.completed
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {day.completed
                          ? 'Tamamlandı'
                          : 'Eksik'}
                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}