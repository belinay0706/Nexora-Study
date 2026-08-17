'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { db, auth } from '../firebase';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

type Badge = {
  id: number;
  title: string;
  desc: string;
  icon: string;
  category: string;
  rarity: Rarity;
  unlocked: boolean;
  progress?: number;
  target?: number;
};

type FirebaseItem = {
  id: string;
  completed?: boolean;
  status?: string;
  createdAt?: any;
  completedAt?: any;
  date?: string;
};

export default function Badges() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);

  // İLERLEME DEĞERLERİ
  const [completedGoals, setCompletedGoals] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [studySessionCount, setStudySessionCount] = useState(0);
  const [solvedQuestionCount, setSolvedQuestionCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  // FIREBASE'DEN VERİLERİ ÇEK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = user.uid;

        // 1. Kullanıcı Ana Dokümanını Kontrol Et (Sayaçlar doğrudan burada tutuluyor olabilir)
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        let pCount = 0;
        let gCount = 0;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Eğer ana dokümanda sayaçlar tutuluyorsa onları alıyoruz
          pCount = userData.tamamlandiPomodorolar || userData.pomodoroCount || 0;
          gCount = userData.completedGoals || 0;
        }

        // 2. HEDEFLER (Alt koleksiyon veya ana doküman fallback)
        const goalsSnapshot = await getDocs(collection(db, 'users', userId, 'goals'));
        const finishedGoals = goalsSnapshot.empty ? gCount : goalsSnapshot.docs.filter(
          (docSnap) => {
            const data = docSnap.data() as FirebaseItem;
            return data.completed === true || data.status === 'completed' || data.status === 'done';
          }
        ).length;
        setCompletedGoals(Math.max(gCount, finishedGoals));

        // 3. POMODORO (Alt koleksiyon veya ana doküman fallback)
        const pomodoroSnapshot = await getDocs(collection(db, 'users', userId, 'pomodoros'));
        const completedPomodoros = pomodoroSnapshot.empty ? pCount : pomodoroSnapshot.docs.filter(
          (docSnap) => {
            const data = docSnap.data() as FirebaseItem;
            return data.completed === true || data.status === 'completed' || data.status === 'done';
          }
        ).length;
        setPomodoroCount(Math.max(pCount, completedPomodoros));

        // 4. ÇALIŞMA OTURUMLARI
        const studySnapshot = await getDocs(collection(db, 'users', userId, 'studySessions'));
        const completedStudySessions = studySnapshot.docs.filter(
          (docSnap) => {
            const data = docSnap.data() as FirebaseItem;
            return data.completed === true || data.status === 'completed' || data.status === 'done';
          }
        ).length;
        setStudySessionCount(completedStudySessions);

        // 5. SORULAR
        const questionsSnapshot = await getDocs(collection(db, 'users', userId, 'questions'));
        const solvedQuestions = questionsSnapshot.docs.filter(
          (docSnap) => {
            const data = docSnap.data() as FirebaseItem;
            return data.status === 'resolved' || data.completed === true || data.status === 'completed';
          }
        ).length;
        setSolvedQuestionCount(solvedQuestions);

        // 6. NOTLAR
        const notesSnapshot = await getDocs(collection(db, 'users', userId, 'notes'));
        setNoteCount(notesSnapshot.size);

      } catch (error) {
        console.error('Rozet verileri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ROZETLER LİSTESİ
  const badges = useMemo<Badge[]>(() => [
    {
      id: 1,
      title: 'İlk Adım',
      desc: 'Nexora Study ile ilk hedefini tamamla.',
      icon: '🎯',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: completedGoals >= 1,
      progress: Math.min(completedGoals, 1),
      target: 1,
    },
    {
      id: 2,
      title: 'İlk Zafer',
      desc: 'İlk günlük hedefini başarıyla tamamla.',
      icon: '🌟',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: completedGoals >= 1,
      progress: Math.min(completedGoals, 1),
      target: 1,
    },
    {
      id: 3,
      title: 'Alışkanlık Başlıyor',
      desc: '3 farklı günde hedeflerinden en az birini tamamla.',
      icon: '🌱',
      category: 'Başlangıç',
      rarity: 'common',
      unlocked: completedGoals >= 3,
      progress: Math.min(completedGoals, 3),
      target: 3,
    },
    {
      id: 4,
      title: 'Alevi Yak',
      desc: '3 gün üst üste günlük hedeflerinin tamamını bitir.',
      icon: '🔥',
      category: 'Seri',
      rarity: 'rare',
      unlocked: completedGoals >= 3,
      progress: Math.min(completedGoals, 3),
      target: 3,
    },
    {
      id: 9,
      title: 'Hedef Avcısı',
      desc: 'Toplam 10 hedef tamamla.',
      icon: '🏹',
      category: 'Hedefler',
      rarity: 'common',
      unlocked: completedGoals >= 10,
      progress: Math.min(completedGoals, 10),
      target: 10,
    },
    {
      id: 13,
      title: 'Çalışma Modu',
      desc: 'İlk çalışma oturumunu tamamla.',
      icon: '📚',
      category: 'Çalışma',
      rarity: 'common',
      unlocked: studySessionCount >= 1,
      progress: Math.min(studySessionCount, 1),
      target: 1,
    },
    {
      id: 16,
      title: 'İlk Odak',
      desc: 'İlk Pomodoro çalışma seansını tamamla.',
      icon: '🍅',
      category: 'Pomodoro',
      rarity: 'common',
      unlocked: pomodoroCount >= 1,
      progress: Math.min(pomodoroCount, 1),
      target: 1,
    },
    {
      id: 17,
      title: 'Odak Makinesi',
      desc: '25 Pomodoro seansını tamamla.',
      icon: '⚙️',
      category: 'Pomodoro',
      rarity: 'rare',
      unlocked: pomodoroCount >= 25,
      progress: Math.min(pomodoroCount, 25),
      target: 25,
    },
    {
      id: 21,
      title: 'Hızlı Kalem',
      desc: 'İlk hızlı notunu oluştur.',
      icon: '✍️',
      category: 'Notlar',
      rarity: 'common',
      unlocked: noteCount >= 1,
      progress: Math.min(noteCount, 1),
      target: 1,
    },
    {
      id: 23,
      title: 'Soru Çözücü',
      desc: '100 soru çözdüğünü kaydet.',
      icon: '📝',
      category: 'Sorular',
      rarity: 'rare',
      unlocked: solvedQuestionCount >= 100,
      progress: Math.min(solvedQuestionCount, 100),
      target: 100,
    },
  ], [completedGoals, pomodoroCount, studySessionCount, solvedQuestionCount, noteCount]);

  const categories = useMemo(() => {
    return ['Tümü', ...Array.from(new Set(badges.map((b) => b.category)))];
  }, [badges]);

  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'Tümü') return badges;
    return badges.filter((b) => b.category === selectedCategory);
  }, [badges, selectedCategory]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const completionPercentage = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;

  const getRarityLabel = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return 'Yaygın';
      case 'rare': return 'Nadir';
      case 'epic': return 'Destansı';
      case 'legendary': return 'Efsanevi';
    }
  };

  const getRarityClass = (rarity: Rarity) => {
    switch (rarity) {
      case 'common': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'rare': return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'epic': return 'bg-purple-950/60 text-purple-300 border-purple-800';
      case 'legendary': return 'bg-amber-950/60 text-amber-300 border-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-slate-900/70 rounded-3xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-slate-400 text-sm">Başarıların yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* ÜST PANEL */}
      <div className="bg-slate-900/70 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Rozet & Başarı Koleksiyonum</h2>
              <p className="text-xs text-slate-400 mt-1">Hedeflerini tamamla, serini koru ve yeni başarıların kilidini aç.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 border border-teal-500/30 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Kazanılan</div>
              <div className="text-xl font-black text-white">{unlockedCount}<span className="text-slate-500">/{badges.length}</span></div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">İlerleme</div>
              <div className="text-xl font-black text-white">%{completionPercentage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KATEGORİLER */}
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

      {/* ROZETLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const progress = badge.progress ?? 0;
          const target = badge.target ?? 0;
          const progressPercentage = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;

          return (
            <div
              key={badge.id}
              className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 ${
                badge.unlocked
                  ? 'bg-slate-900/70 border-teal-500/40 shadow-lg shadow-teal-950/20 hover:-translate-y-1'
                  : 'bg-slate-950/50 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${badge.unlocked ? 'bg-slate-800 border-teal-500/30' : 'bg-slate-900 border-slate-800 grayscale'}`}>
                  {badge.unlocked ? badge.icon : '🔒'}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRarityClass(badge.rarity)}`}>
                  {getRarityLabel(badge.rarity)}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mt-5">{badge.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[40px]">{badge.desc}</p>

              {!badge.unlocked && typeof badge.target === 'number' && (
                <div className="mt-5">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-2">
                    <span>İlerleme</span>
                    <span>{progress} / {target}</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${badge.unlocked ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                  {badge.unlocked ? 'Kazanıldı ✨' : 'Kilitli 🔒'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}