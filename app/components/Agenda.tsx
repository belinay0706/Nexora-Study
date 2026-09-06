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

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

interface DayData {
  content: string;
  goal: string;
  stickers: Sticker[];
}

type AgendaData = Record<string, DayData>;

const days = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

const createEmptyAgenda = (): AgendaData => ({
  Pazartesi: { content: '', goal: '', stickers: [] },
  Salı: { content: '', goal: '', stickers: [] },
  Çarşamba: { content: '', goal: '', stickers: [] },
  Perşembe: { content: '', goal: '', stickers: [] },
  Cuma: { content: '', goal: '', stickers: [] },
  Cumartesi: { content: '', goal: '', stickers: [] },
  Pazar: { content: '', goal: '', stickers: [] },
});

export default function DigitalAgenda() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [activeDay, setActiveDay] = useState('Pazartesi');
  const [isFlipping, setIsFlipping] = useState(false);

  const [fontStyle, setFontStyle] = useState('font-sans');
  const [textColor, setTextColor] = useState('text-gray-900');
  const [textSize, setTextSize] = useState('text-lg');

  const [currentTheme, setCurrentTheme] = useState('pastel');
  const [pageStyle, setPageStyle] = useState('lined');

  const [agendaData, setAgendaData] = useState<AgendaData>(createEmptyAgenda());

  const [draggingId, setDraggingId] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);

  const themes: Record<
    string,
    {
      bg: string;
      border: string;
      tabBg: string;
      activeTab: string;
      textHead: string;
      inputBg: string;
      lineColor: string;
    }
  > = {
    pastel: {
      bg: 'bg-[#fdfbf7]',
      border: 'border-amber-900/10',
      tabBg: 'bg-amber-100/60 text-amber-900',
      activeTab: 'bg-amber-700 text-white',
      textHead: 'text-amber-950',
      inputBg: 'bg-white/70 border-amber-200 text-amber-900',
      lineColor: '#e5d5c0',
    },
    minimal: {
      bg: 'bg-white',
      border: 'border-gray-200',
      tabBg: 'bg-gray-100 text-gray-700',
      activeTab: 'bg-gray-900 text-white',
      textHead: 'text-gray-900',
      inputBg: 'bg-gray-50 border-gray-200 text-gray-800',
      lineColor: '#e5e7eb',
    },
    cute: {
      bg: 'bg-pink-50/60',
      border: 'border-pink-200',
      tabBg: 'bg-pink-100/80 text-pink-900',
      activeTab: 'bg-pink-500 text-white',
      textHead: 'text-pink-950',
      inputBg: 'bg-white/80 border-pink-200 text-pink-900',
      lineColor: '#fbcfe8',
    },
    academic: {
      bg: 'bg-[#f4f1ea]',
      border: 'border-stone-400/30',
      tabBg: 'bg-stone-200 text-stone-800',
      activeTab: 'bg-stone-800 text-white',
      textHead: 'text-stone-900',
      inputBg: 'bg-[#fdfbf7] border-stone-300 text-stone-900',
      lineColor: '#d6d3d1',
    },
    dark: {
      bg: 'bg-gray-900',
      border: 'border-gray-800',
      tabBg: 'bg-gray-800 text-gray-300',
      activeTab: 'bg-indigo-600 text-white',
      textHead: 'text-gray-100',
      inputBg: 'bg-gray-800/80 border-gray-700 text-gray-100',
      lineColor: '#374151',
    },
  };

  const currentThemeStyles = themes[currentTheme] || themes.pastel;

  const availableStickers = [
    '☕', '⭐', '🎀', '📚', '🌸', '💻', '💡', '🎧',
    '🎯', '🌿', '✨', '💖', '📌', '🎨', '🚀', '🍩',
    '🐱', '🍀', '🍎', '🌙', '🔥', '💎', '🧸', '📝',
  ];

  const fontOptions = [
    { name: 'Modern', class: 'font-sans' },
    { name: 'Klasik', class: 'font-serif' },
    { name: 'El Yazısı', class: 'font-mono' },
  ];

  const colorOptions = [
    { name: 'Siyah', class: 'text-gray-900', bg: 'bg-gray-900' },
    { name: 'Kırmızı', class: 'text-red-600', bg: 'bg-red-600' },
    { name: 'Mavi', class: 'text-blue-600', bg: 'bg-blue-600' },
    { name: 'Sarı', class: 'text-amber-500', bg: 'bg-amber-500' },
    { name: 'Yeşil', class: 'text-emerald-600', bg: 'bg-emerald-600' },
    { name: 'Pembe', class: 'text-pink-600', bg: 'bg-pink-600' },
    { name: 'Mor', class: 'text-purple-600', bg: 'bg-purple-600' },
  ];

  const sizeOptions = [
    { name: 'Normal', class: 'text-base' },
    { name: 'Büyük', class: 'text-lg' },
    { name: 'Çok Büyük', class: 'text-xl' },
    { name: 'Dev', class: 'text-2xl' },
  ];

  // Sayfa Değiştirme Tetikleyicisi (CSS Flip Efekti)
  const handleDayChange = (newDay: string) => {
    if (newDay === activeDay) return;
    setIsFlipping(true);
    setTimeout(() => {
      setActiveDay(newDay);
      setIsFlipping(false);
    }, 200);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setAgendaData(createEmptyAgenda());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const userRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.agendaData) {
            setAgendaData({
              ...createEmptyAgenda(),
              ...(data.agendaData as AgendaData),
            });
          } else {
            setAgendaData(createEmptyAgenda());
          }
        } else {
          setAgendaData(createEmptyAgenda());
        }
      } catch (err) {
        console.error('Ajanda yüklenemedi:', err);
        setError('Ajanda verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveAgenda = async (newData: AgendaData, countActivity = false): Promise<boolean> => {
    if (!user) {
      setError('Giriş yapmalısın.');
      return false;
    }

    try {
      setSaving(true);
      setError('');

      const userRef = doc(db, 'users', user.uid);
      const updateData: Record<string, unknown> = {
        agendaData: newData,
        lastAgendaActivityAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (countActivity) {
        updateData.agendaDaysUsed = increment(1);
      }

      await setDoc(userRef, updateData, { merge: true });
      setAgendaData(newData);
      return true;
    } catch (err) {
      console.error('Ajanda kaydedilemedi:', err);
      setError('Ajanda kaydedilemedi.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (field: 'content' | 'goal', value: string) => {
    const currentDay = agendaData[activeDay] || { content: '', goal: '', stickers: [] };
    const wasEmpty = !currentDay.content.trim() && !currentDay.goal.trim();

    const updated: AgendaData = {
      ...agendaData,
      [activeDay]: {
        ...currentDay,
        [field]: value,
      },
    };

    const shouldCountActivity = wasEmpty && value.trim().length > 0;
    await saveAgenda(updated, shouldCountActivity);
  };

  const addSticker = async (emoji: string) => {
    const currentDay = agendaData[activeDay] || { content: '', goal: '', stickers: [] };
    const currentStickers = currentDay.stickers || [];

    const newSticker: Sticker = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: 60 + ((currentStickers.length * 20) % 350),
      y: 120 + ((currentStickers.length * 20) % 250),
    };

    const updated: AgendaData = {
      ...agendaData,
      [activeDay]: {
        ...currentDay,
        stickers: [...currentStickers, newSticker],
      },
    };

    await saveAgenda(updated);
  };

  const removeSticker = async (stickerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentDay = agendaData[activeDay];
    if (!currentDay) return;

    const updatedStickers = currentDay.stickers.filter((s) => s.id !== stickerId);
    const updated: AgendaData = {
      ...agendaData,
      [activeDay]: {
        ...currentDay,
        stickers: updatedStickers,
      },
    };

    await saveAgenda(updated);
  };

  const handleMouseDown = (id: string) => {
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !pageRef.current) return;
    const currentDay = agendaData[activeDay];
    if (!currentDay) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 25;
    const y = e.clientY - rect.top - 25;

    const updatedStickers = currentDay.stickers.map((sticker) => {
      if (sticker.id === draggingId) {
        return {
          ...sticker,
          x: Math.max(10, Math.min(rect.width - 60, x)),
          y: Math.max(80, Math.min(rect.height - 100, y)),
        };
      }
      return sticker;
    });

    setAgendaData({
      ...agendaData,
      [activeDay]: {
        ...currentDay,
        stickers: updatedStickers,
      },
    });
  };

  const handleMouseUp = async () => {
    if (!draggingId) return;
    setDraggingId(null);
    await saveAgenda(agendaData);
  };

  const getPageBackgroundStyle = () => {
    const line = currentThemeStyles.lineColor;
    if (pageStyle === 'lined') {
      return {
        backgroundImage: `repeating-linear-gradient(transparent, transparent 47px, ${line} 47px, ${line} 48px)`,
        backgroundSize: '100% 48px',
      };
    }
    if (pageStyle === 'grid') {
      return {
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      };
    }
    if (pageStyle === 'dots') {
      return {
        backgroundImage: `radial-gradient(${line} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
      };
    }
    return {};
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl p-8 shadow-xl border border-amber-200 text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-4 border-amber-100 border-t-amber-700 animate-spin" />
          <p className="font-bold text-gray-800">Belora Ajanda Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl p-8 shadow-xl border border-amber-200 text-center">
          <div className="text-3xl mb-2">🔐</div>
          <h2 className="text-lg font-bold text-gray-800">Dijital Ajanda</h2>
          <p className="text-xs text-gray-500 mt-1">Devam etmek için giriş yapmalısın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 [perspective:1000px]">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-600 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* ÜST ARAÇ ÇUBUĞU - GÜNLER & TEMALAR */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 bg-amber-100/60 p-1.5 rounded-xl">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayChange(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDay === day
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              📖 {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 mr-1">Tema:</span>
          {['pastel', 'minimal', 'cute', 'academic', 'dark'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCurrentTheme(t)}
              className={`px-2 py-1 text-xs rounded-lg font-semibold capitalize cursor-pointer ${
                currentTheme === t
                  ? 'bg-amber-700 text-white shadow'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* İKİNCİ ARAÇ ÇUBUĞU - SAYFA STİLİ, YAZI TİPİ, BOYUT, RENK */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        {/* Sayfa Çizgisi */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
          <span className="text-[11px] font-bold text-amber-900 mr-1">Sayfa:</span>
          {[
            { id: 'lined', name: 'Çizgili' },
            { id: 'grid', name: 'Kareli' },
            { id: 'dots', name: 'Noktalı' },
            { id: 'plain', name: 'Düz' },
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setPageStyle(style.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold cursor-pointer transition-all ${
                pageStyle === style.id
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>

        {/* Yazı Tipi */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
          <span className="text-[11px] font-bold text-amber-900 mr-1">Yazı:</span>
          {fontOptions.map((font) => (
            <button
              key={font.class}
              type="button"
              onClick={() => setFontStyle(font.class)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold cursor-pointer transition-all ${
                fontStyle === font.class
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              {font.name}
            </button>
          ))}
        </div>

        {/* Boyut */}
        <div className="flex items-center gap-1.5 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
          <span className="text-[11px] font-bold text-amber-900 mr-1">Boyut:</span>
          {sizeOptions.map((size) => (
            <button
              key={size.class}
              type="button"
              onClick={() => setTextSize(size.class)}
              className={`px-2 py-1 text-xs rounded-lg font-semibold cursor-pointer transition-all ${
                textSize === size.class
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-200/50'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>

        {/* Renk */}
        <div className="flex items-center gap-2 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-200/60">
          <span className="text-[11px] font-bold text-amber-900 mr-1">Renk:</span>
          {colorOptions.map((color) => (
            <button
              key={color.class}
              type="button"
              onClick={() => setTextColor(color.class)}
              className={`w-5 h-5 rounded-full ${color.bg} cursor-pointer transition-transform ${
                textColor === color.class ? 'scale-125 ring-2 ring-offset-2 ring-amber-600' : 'hover:scale-110 opacity-80'
              }`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* AJANDA DEFTER SAYFASI - CSS FLIP EFEKTI ILE */}
      <div
        ref={pageRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={getPageBackgroundStyle()}
        className={`relative ${currentThemeStyles.bg} rounded-3xl p-8 md:p-12 shadow-2xl border-4 ${currentThemeStyles.border} min-h-[650px] flex flex-col justify-between overflow-hidden select-none transition-all duration-300 transform origin-left ${
          isFlipping ? 'rotate-y-90 opacity-20 scale-95' : 'rotate-y-0 opacity-100 scale-100'
        }`}
      >
        {/* Defter Cilt Sınırı */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/15 via-black/5 to-transparent pointer-events-none" />

        {/* STICKERLAR */}
        {agendaData[activeDay]?.stickers?.map((sticker) => (
          <div
            key={sticker.id}
            onMouseDown={() => handleMouseDown(sticker.id)}
            className="absolute text-5xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform drop-shadow-xl z-30 group"
            style={{ left: `${sticker.x}px`, top: `${sticker.y}px` }}
          >
            {sticker.emoji}
            <button
              type="button"
              onClick={(e) => removeSticker(sticker.id, e)}
              className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] rounded-full w-5 h-5 hidden group-hover:flex items-center justify-center font-bold shadow-md cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}

        <div className="relative z-10 space-y-6">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 ${currentThemeStyles.border} pb-4`}>
            <div>
              <span className={`text-xs font-bold uppercase tracking-widest opacity-70 ${currentThemeStyles.textHead}`}>
                Belora Dijital Günlük
              </span>
              <h1 className={`text-3xl font-extrabold ${currentThemeStyles.textHead}`}>
                {activeDay} Sayfası
              </h1>
            </div>
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="🎯 Bugünün en büyük hedefi nedir?"
                value={agendaData[activeDay]?.goal || ''}
                onChange={(e) => handleUpdate('goal', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${currentThemeStyles.inputBg}`}
              />
            </div>
          </div>

          <div>
            <textarea
              placeholder="Sevgili Belora ajandam, bugün neler yaptın? Dersler, planlar, aklından geçenler..."
              value={agendaData[activeDay]?.content || ''}
              onChange={(e) => handleUpdate('content', e.target.value)}
              rows={14}
              className={`w-full bg-transparent border-0 focus:outline-none resize-none leading-[3rem] pt-1 ${fontStyle} ${textColor} ${textSize} placeholder-current placeholder-opacity-30`}
            />
          </div>
        </div>

        {/* STICKER SEÇME PANELİ */}
        <div className={`relative z-10 mt-6 pt-4 border-t ${currentThemeStyles.border} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
            <span className={`text-xs font-bold mr-2 shrink-0 opacity-80 ${currentThemeStyles.textHead}`}>
              Sticker Yap ✨:
            </span>
            {availableStickers.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSticker(emoji)}
                className="w-10 h-10 bg-white/90 hover:bg-amber-100 rounded-xl border border-amber-200 shadow-sm flex items-center justify-center text-xl hover:scale-110 transition-all shrink-0 active:scale-90 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className={`text-xs font-medium opacity-60 shrink-0 ${currentThemeStyles.textHead}`}>
            {saving ? 'Kaydediliyor...' : 'Firebase\'e kaydedildi 💾'}
          </div>
        </div>
      </div>
    </div>
  );
}