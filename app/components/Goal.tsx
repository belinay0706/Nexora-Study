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

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

const AVAILABLE_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_goal', title: 'İlk Adım', description: 'İlk hedefini tamamla.', icon: '🎯' },
  { id: 'streak_3', title: 'İstikrar Kıvılcımı', description: '3 günlük seri yakala.', icon: '🔥' },
  { id: 'streak_7', title: 'Hız Kesmiyorsun', description: '7 günlük seri yakala.', icon: '⚡' },
  { id: 'master_10', title: 'Hedef Avcısı', description: 'Toplam 10 günü tamamen bitir.', icon: '🏆' },
];

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalHistory, setGoalHistory] = useState<GoalHistory>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCompletedDays, setTotalCompletedDays] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);

  const [newGoalText, setNewGoalText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const todayKey = useMemo(() => getLocalDateKey(), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);

        if (!firebaseUser) {
          setGoals([]);
          setGoalHistory({});
          setCurrentStreak(0);
          setBestStreak(0);
          setTotalCompletedDays(0);
          setBadges([]);
          setIsLoading(false);
          return;
        }

        await loadGoalData(firebaseUser);
      }
    );

    return () => unsubscribe();
  }, []);

  const checkAndUnlockBadges = (
    currentTotalDays: number,
    streak: number,
    existingBadges: Badge[]
  ) => {
    const now = new Date().toISOString();
    
    return AVAILABLE_BADGES.map((b) => {
      const existing = existingBadges.find((item) => item.id === b.id);
      if (existing && existing.unlockedAt) {
        return existing;
      }

      let unlocked = false;
      if (b.id === 'first_goal' && currentTotalDays >= 1) unlocked = true;
      if (b.id === 'streak_3' && streak >= 3) unlocked = true;
      if (b.id === 'streak_7' && streak >= 7) unlocked = true;
      if (b.id === 'master_10' && currentTotalDays >= 10) unlocked = true;

      return {
        ...b,
        unlockedAt: unlocked ? (existing?.unlockedAt || now) : null,
      };
    });
  };

  const loadGoalData = async (firebaseUser: User) => {
    setIsLoading(true);
    setSaveError('');

    try {
      const profileRef = doc(db, 'users', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        setGoals([]);
        setGoalHistory({});
        setCurrentStreak(0);
        setBestStreak(0);
        setTotalCompletedDays(0);
        setBadges(checkAndUnlockBadges(0, 0, []));
        return;
      }

      const data = profileSnap.data();

      const storedGoals = Array.isArray(data.goals)
        ? (data.goals as Goal[])
        : [];

      const storedHistory =
        data.goalHistory && typeof data.goalHistory === 'object'
          ? (data.goalHistory as GoalHistory)
          : {};

      const storedCurrentStreak =
        typeof data.currentStreak === 'number' ? data.currentStreak : 0;

      const storedBestStreak =
        typeof data.bestStreak === 'number' ? data.bestStreak : 0;

      const storedTotalCompletedDays =
        typeof data.totalCompletedDays === 'number' ? data.totalCompletedDays : 0;

      const storedBadges = Array.isArray(data.badges)
        ? (data.badges as Badge[])
        : [];

      setGoals(storedGoals);
      setGoalHistory(storedHistory);
      setCurrentStreak(storedCurrentStreak);
      setBestStreak(storedBestStreak);
      setTotalCompletedDays(storedTotalCompletedDays);
      setBadges(checkAndUnlockBadges(storedTotalCompletedDays, storedCurrentStreak, storedBadges));
    } catch (error) {
      console.error('Hedefler yüklenemedi:', error);
      setSaveError('Hedefler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoalData = async (
    updatedGoals: Goal[],
    updatedHistory: GoalHistory,
    updatedCurrentStreak: number,
    updatedBestStreak: number,
    updatedTotalCompletedDays: number,
    updatedBadges: Badge[]
  ) => {
    if (!user) return;

    try {
      const profileRef = doc(db, 'users', user.uid);

      // Toplam tamamlanan bireysel hedef sayısı
      const totalIndividualCompletedGoals = updatedGoals.filter(g => g.completed).length;

      await setDoc(
        profileRef,
        {
          goals: updatedGoals,
          goalHistory: updatedHistory,
          currentStreak: updatedCurrentStreak,
          bestStreak: updatedBestStreak,
          totalCompletedDays: updatedTotalCompletedDays,
          completedGoalsCount: updatedTotalCompletedDays,
          completedGoals: totalIndividualCompletedGoals, // 🏅 Rozetler sayfasının okuduğu sayaç!
          badges: updatedBadges,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Hedefler kaydedilemedi:', error);
      setSaveError('Değişiklikler kaydedilemedi.');
    }
  };

  const todaysGoals = useMemo(() => {
    return goals.filter((goal) => goal.date === todayKey);
  }, [goals, todayKey]);

  const completedCount = useMemo(() => {
    return todaysGoals.filter((goal) => goal.completed).length;
  }, [todaysGoals]);

  const totalToday = todaysGoals.length;

  const allGoalsCompleted =
    totalToday > 0 && completedCount === totalToday;

  const buildTodayHistory = (
    updatedGoals: Goal[],
    existingHistory: GoalHistory
  ) => {
    const updatedHistory = { ...existingHistory };
    const todayGoals = updatedGoals.filter((goal) => goal.date === todayKey);

    if (todayGoals.length === 0) {
      delete updatedHistory[todayKey];
      return updatedHistory;
    }

    const completedToday = todayGoals.filter((goal) => goal.completed).length;
    const totalTodayGoals = todayGoals.length;
    const dayCompleted = completedToday === totalTodayGoals;

    updatedHistory[todayKey] = {
      completed: dayCompleted,
      completedCount: completedToday,
      totalCount: totalTodayGoals,
    };

    return updatedHistory;
  };

  const processAndUpdate = async (
    updatedGoals: Goal[],
    updatedHistory: GoalHistory
  ) => {
    const calculatedStreak = calculateStreak(updatedHistory, todayKey);
    const newBestStreak = Math.max(bestStreak, calculatedStreak);
    const newTotalCompletedDays = Object.values(updatedHistory).filter(
      (day) => day.completed
    ).length;

    const updatedBadges = checkAndUnlockBadges(
      newTotalCompletedDays,
      calculatedStreak,
      badges
    );

    setGoals(updatedGoals);
    setGoalHistory(updatedHistory);
    setCurrentStreak(calculatedStreak);
    setBestStreak(newBestStreak);
    setTotalCompletedDays(newTotalCompletedDays);
    setBadges(updatedBadges);

    await saveGoalData(
      updatedGoals,
      updatedHistory,
      calculatedStreak,
      newBestStreak,
      newTotalCompletedDays,
      updatedBadges
    );
  };

  const addGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanText = newGoalText.trim();

    if (!cleanText || !user) return;

    const newGoal: Goal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: cleanText,
      completed: false,
      date: todayKey,
      completedAt: null,
    };

    const updatedGoals = [...goals, newGoal];
    const updatedHistory = buildTodayHistory(updatedGoals, goalHistory);

    setNewGoalText('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);

    await processAndUpdate(updatedGoals, updatedHistory);
  };

  const toggleGoal = async (goalId: string) => {
    if (!user) return;

    const updatedGoals = goals.map((goal) => {
      if (goal.id !== goalId) return goal;
      const nextCompleted = !goal.completed;
      return {
        ...goal,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null,
      };
    });

    const updatedHistory = buildTodayHistory(updatedGoals, goalHistory);
    await processAndUpdate(updatedGoals, updatedHistory);
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    const updatedGoals = goals.filter((goal) => goal.id !== goalId);
    const updatedHistory = buildTodayHistory(updatedGoals, goalHistory);

    await processAndUpdate(updatedGoals, updatedHistory);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-slate-900/75 backdrop-blur-md border border-slate-800 rounded-3xl px-8 py-6 text-center shadow-2xl">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-white/10 border-t-teal-400 animate-spin" />
          <p className="text-sm font-semibold text-white">Hedeflerin yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-slate-900/75 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-white mb-2">Hedefler</h2>
          <p className="text-sm text-slate-400">Hedeflerini görmek için giriş yapmalısın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {saveError && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            ⚠️ {saveError}
          </div>
        )}

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
                Hedeflerini yaz, tamamladıkça tikle ve serini büyüt.
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
                En uzun seri: {bestStreak} gün
              </div>
            </div>
          </div>
        </div>

        {/* ROZETLER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h2 className="font-extrabold text-white text-xl mb-4">
            🎖️ Başarı Rozetleri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const isUnlocked = badge.unlockedAt !== null;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 border flex items-center gap-4 transition-all ${
                    isUnlocked
                      ? 'bg-amber-500/10 border-amber-400/30 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isUnlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                      {badge.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {badge.description}
                    </p>
                    <div className="text-[10px] font-semibold mt-1">
                      {isUnlocked ? '✨ Kazanıldı' : '🔒 Kilitli'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GÜN TAMAMLANDI */}
        {allGoalsCompleted && (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {currentStreak <= 1 ? '1. Gün Tamamlandı! 🏆' : `${currentStreak}. Gün Tamamlandı! 🔥`}
                </h2>
                <p className="text-sm text-emerald-200/80 mt-1">
                  Bugünkü bütün hedeflerini tamamladın. Harika ilerliyorsun! 🔥
                </p>
              </div>
            </div>
          </div>
        )}

        {/* YENİ HEDEF EKLE */}
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
              onChange={(event) => setNewGoalText(event.target.value)}
              placeholder="Örn: 30 dakika C# çalışması yap"
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-2xl font-extrabold transition cursor-pointer ${
                showSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:scale-[1.02]'
              }`}
            >
              {showSuccess ? 'Eklendi! ✨' : 'Hedef Ekle'}
            </button>
          </form>
        </div>

        {/* BUGÜNÜN HEDEFLERİ */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-extrabold text-white text-xl">
                📋 Bugünün Hedefleri
              </h2>
              <p className="text-xs text-slate-400 mt-1">Tamamlamak için tikle.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">
              {completedCount}/{totalToday}
            </span>
          </div>

          {todaysGoals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-white font-bold">Henüz bugünün hedefi yok.</h3>
              <p className="text-xs text-slate-500 mt-1">Yukarıdan ilk hedefini ekle.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    goal.completed
                      ? 'bg-emerald-500/10 border-emerald-400/20'
                      : 'bg-slate-950/50 border-slate-800 hover:border-teal-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal.id)}
                        className="w-6 h-6 shrink-0 accent-teal-500 cursor-pointer"
                      />
                      <div
                        className={`text-sm font-semibold break-words ${
                          goal.completed ? 'text-slate-500 line-through' : 'text-white'
                        }`}
                      >
                        {goal.text}
                      </div>
                    </div>

                    {/* SİL BUTONU */}
                    <button
                      type="button"
                      onClick={() => deleteGoal(goal.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}