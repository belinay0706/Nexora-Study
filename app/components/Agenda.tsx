'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export default function DigitalAgenda() {
  const [activeDay, setActiveDay] = useState('Pazartesi');
  const [fontStyle, setFontStyle] = useState('font-sans');
  const [textColor, setTextColor] = useState('text-gray-900');
  const [textSize, setTextSize] = useState('text-lg');
  
  // Tema ve Sayfa Tipi State'leri
  const [currentTheme, setCurrentTheme] = useState('pastel');
  const [pageStyle, setPageStyle] = useState('lined'); // lined, grid, dotted, blank

  const [agendaData, setAgendaData] = useState<Record<string, { content: string; goal: string; stickers: Sticker[] }>>({
    'Pazartesi': { content: '', goal: '', stickers: [] },
    'Salı': { content: '', goal: '', stickers: [] },
    'Çarşamba': { content: '', goal: '', stickers: [] },
    'Perşembe': { content: '', goal: '', stickers: [] },
    'Cuma': { content: '', goal: '', stickers: [] },
    'Cumartesi': { content: '', goal: '', stickers: [] },
    'Pazar': { content: '', goal: '', stickers: [] },
  });

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const availableStickers = [
    '☕', '⭐', '🎀', '📚', '🌸', '💻', '💡', '🎧', 
    '🎯', '🌿', '✨', '💖', '📌', '🎨', '🚀', '🍩', 
    '🐱', '🍀', '🍎', '🌙', '🔥', '💎', '🧸', '📝'
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

  // Tema Seçenekleri
  const themes: Record<string, { bg: string; border: string; tabBg: string; activeTab: string; textHead: string; inputBg: string }> = {
    pastel: {
      bg: 'bg-[#fdfbf7]',
      border: 'border-amber-900/10',
      tabBg: 'bg-amber-100/60 text-amber-900',
      activeTab: 'bg-amber-700 text-white',
      textHead: 'text-amber-950',
      inputBg: 'bg-white/70 border-amber-200 text-amber-900'
    },
    minimal: {
      bg: 'bg-white',
      border: 'border-gray-200',
      tabBg: 'bg-gray-100 text-gray-700',
      activeTab: 'bg-gray-900 text-white',
      textHead: 'text-gray-900',
      inputBg: 'bg-gray-50 border-gray-200 text-gray-800'
    },
    cute: {
      bg: 'bg-pink-50/60',
      border: 'border-pink-200',
      tabBg: 'bg-pink-100/80 text-pink-900',
      activeTab: 'bg-pink-500 text-white',
      textHead: 'text-pink-950',
      inputBg: 'bg-white/80 border-pink-200 text-pink-900'
    },
    academic: {
      bg: 'bg-[#f4f1ea]',
      border: 'border-stone-400/30',
      tabBg: 'bg-stone-200 text-stone-800',
      activeTab: 'bg-stone-800 text-white',
      textHead: 'text-stone-900',
      inputBg: 'bg-[#fdfbf7] border-stone-300 text-stone-900'
    },
    dark: {
      bg: 'bg-gray-900',
      border: 'border-gray-800',
      tabBg: 'bg-gray-800 text-gray-300',
      activeTab: 'bg-indigo-600 text-white',
      textHead: 'text-gray-100',
      inputBg: 'bg-gray-800/80 border-gray-700 text-gray-100'
    }
  };

  const currentThemeStyles = themes[currentTheme] || themes.pastel;

  // Sürükleme State'leri
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexore_book_agenda_v4');
    if (saved) {
      try {
        setAgendaData(JSON.parse(saved));
      } catch (e) {
        console.error("Ajanda yüklenemedi", e);
      }
    }
  }, []);

  const saveToStorage = (newData: typeof agendaData) => {
    setAgendaData(newData);
    localStorage.setItem('nexore_book_agenda_v4', JSON.stringify(newData));
  };

  const handleUpdate = (field: 'content' | 'goal', value: string) => {
    const updated = {
      ...agendaData,
      [activeDay]: { ...agendaData[activeDay], [field]: value }
    };
    saveToStorage(updated);
  };

  const addSticker = (emoji: string) => {
    const currentStickers = agendaData[activeDay]?.stickers || [];
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 60 + (currentStickers.length * 20) % 350,
      y: 120 + (currentStickers.length * 20) % 250,
    };
    const updatedStickers = [...currentStickers, newSticker];
    const updated = {
      ...agendaData,
      [activeDay]: { ...agendaData[activeDay], stickers: updatedStickers }
    };
    saveToStorage(updated);
  };

  const removeSticker = (stickerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedStickers = agendaData[activeDay].stickers.filter(s => s.id !== stickerId);
    const updated = {
      ...agendaData,
      [activeDay]: { ...agendaData[activeDay], stickers: updatedStickers }
    };
    saveToStorage(updated);
  };

  const handleMouseDown = (id: string) => {
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 25;
    const y = e.clientY - rect.top - 25;

    const updatedStickers = agendaData[activeDay].stickers.map(sticker => {
      if (sticker.id === draggingId) {
        return { ...sticker, x: Math.max(10, Math.min(rect.width - 60, x)), y: Math.max(80, Math.min(rect.height - 100, y)) };
      }
      return sticker;
    });

    setAgendaData({
      ...agendaData,
      [activeDay]: { ...agendaData[activeDay], stickers: updatedStickers }
    });
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
      saveToStorage(agendaData);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Üst Araç Çubuğu 1: Günler ve Temalar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        
        {/* Günler */}
        <div className="flex flex-wrap gap-1 bg-amber-100/60 p-1.5 rounded-xl">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all transform active:scale-95 ${
                activeDay === day
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              📖 {day}
            </button>
          ))}
        </div>

        {/* Tema Seçenekleri */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 mr-1">Tema:</span>
          {[
            { id: 'pastel', label: 'Pastel' },
            { id: 'minimal', label: 'Minimal' },
            { id: 'cute', label: 'Cute' },
            { id: 'academic', label: 'Academic' },
            { id: 'dark', label: 'Dark' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCurrentTheme(t.id)}
              className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all ${
                currentTheme === t.id ? 'bg-amber-700 text-white shadow' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Üst Araç Çubuğu 2: Sayfa Tipi, Yazı Stili, Boyutu ve Renk */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
        
        {/* Sayfa Arka Plan Düzeni (Çizgili, Kareli, Noktalı, Düz) */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 mr-1">Sayfa:</span>
          {[
            { id: 'lined', label: 'Çizgili' },
            { id: 'grid', label: 'Kareli' },
            { id: 'dotted', label: 'Noktalı' },
            { id: 'blank', label: 'Düz' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPageStyle(p.id)}
              className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all ${
                pageStyle === p.id ? 'bg-amber-700 text-white shadow' : 'text-amber-900 hover:bg-amber-200/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Yazı Tipi, Boyutu ve Renk */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Yazı Tipi */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800">Yazı:</span>
            {fontOptions.map(font => (
              <button
                key={font.class}
                onClick={() => setFontStyle(font.class)}
                className={`px-1.5 py-0.5 text-xs rounded ${font.class === fontStyle ? 'bg-amber-700 text-white' : 'text-amber-900 hover:bg-amber-200'}`}
              >
                {font.name}
              </button>
            ))}
          </div>

          {/* Yazı Boyutu */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800">Boyut:</span>
            {sizeOptions.map(size => (
              <button
                key={size.class}
                onClick={() => setTextSize(size.class)}
                className={`px-1.5 py-0.5 text-xs rounded ${size.class === textSize ? 'bg-amber-700 text-white' : 'text-amber-900 hover:bg-amber-200'}`}
              >
                {size.name}
              </button>
            ))}
          </div>

          {/* Renk Paleti */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800">Renk:</span>
            {colorOptions.map(color => (
              <button
                key={color.class}
                onClick={() => setTextColor(color.class)}
                className={`w-4 h-4 rounded-full border border-white shadow-sm ${color.bg} ${color.class === textColor ? 'ring-2 ring-offset-1 ring-amber-700 scale-110' : 'hover:scale-105'}`}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Kitap Defter Sayfası */}
      <div 
        ref={pageRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative ${currentThemeStyles.bg} rounded-3xl p-8 md:p-12 shadow-2xl border-4 ${currentThemeStyles.border} min-h-[650px] flex flex-col justify-between overflow-hidden select-none transition-colors duration-300`}
      >
        
        {/* Cilt Gölgesi */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none" />
        
        {/* Sayfa Arka Plan Düzeni Desenleri */}
        {pageStyle === 'lined' && (
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:100%_32px] pointer-events-none" />
        )}
        {pageStyle === 'grid' && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
        )}
        {pageStyle === 'dotted' && (
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        )}

        {/* Taşınabilir Sticker Alanı */}
        {agendaData[activeDay]?.stickers?.map((sticker) => (
          <div
            key={sticker.id}
            onMouseDown={() => handleMouseDown(sticker.id)}
            className="absolute text-5xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform drop-shadow-xl z-30 group"
            style={{ left: `${sticker.x}px`, top: `${sticker.y}px` }}
            title="Sürükleyerek taşı / Çarpıya basarak sil"
          >
            {sticker.emoji}
            <button
              onClick={(e) => removeSticker(sticker.id, e)}
              className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] rounded-full w-5 h-5 hidden group-hover:flex items-center justify-center font-bold shadow-md"
            >
              ×
            </button>
          </div>
        ))}

        {/* İçerik Alanı */}
        <div className="relative z-10 space-y-6">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 ${currentThemeStyles.border} pb-4`}>
            <div>
              <span className={`text-xs font-bold uppercase tracking-widest opacity-70 ${currentThemeStyles.textHead}`}>Dijital Günlük</span>
              <h1 className={`text-3xl font-extrabold ${currentThemeStyles.textHead}`}>{activeDay} Sayfası</h1>
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

          {/* Ana Metin Kutusu */}
          <div>
            <textarea
              placeholder="Sevgili ajandam, bugün neler yaptın? Dersler, planlar, aklından geçenler..."
              value={agendaData[activeDay]?.content || ''}
              onChange={(e) => handleUpdate('content', e.target.value)}
              rows={12}
              className={`w-full bg-transparent border-0 focus:outline-none resize-none leading-loose ${fontStyle} ${textColor} ${textSize} placeholder-current placeholder-opacity-30`}
            />
          </div>
        </div>

        {/* Alt Sticker Paneli */}
        <div className={`relative z-10 mt-6 pt-4 border-t ${currentThemeStyles.border} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
            <span className={`text-xs font-bold mr-2 shrink-0 opacity-80 ${currentThemeStyles.textHead}`}>Sticker Yapıştır ✨:</span>
            {availableStickers.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addSticker(emoji)}
                className="w-10 h-10 bg-white/90 hover:bg-amber-100 rounded-xl border border-amber-200 shadow-sm flex items-center justify-center text-xl hover:scale-110 transition-all shrink-0 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className={`text-xs font-medium opacity-60 shrink-0 ${currentThemeStyles.textHead}`}>
            Otomatik Kaydedildi 💾
          </div>
        </div>

      </div>
    </div>
  );
}