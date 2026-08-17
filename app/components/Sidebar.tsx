'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLevel: string;
  currentTheme?: string;
  onLogout: () => void;
  currentUserName: string;
  userEmail: string | null;
  isOpen?: boolean;          // Mobilde menünün açık/kapalı durumu için
  setIsOpen?: (open: boolean) => void; // Menüyü kapatmak için
}

const menuItems = [
  { id: 'anasayfa', label: 'Ana Sayfa', icon: '🏠' },
  { id: 'aikoç', label: 'AI Koç', icon: '🤖' },
  { id: 'programım', label: 'Programım', icon: '📅' },
  { id: 'hızlı notlar', label: 'Hızlı Notlar', icon: '📝' },
  { id: 'dijital ajanda', label: 'Dijital Ajanda', icon: '📓' },
  { id: 'yapamadığım sorular', label: 'Yapamadığım Sorular', icon: '❌' },
  { id: 'takvim', label: 'Takvim', icon: '🗓️' },
  { id: 'pomodoro', label: 'Pomodoro', icon: '🍅' },
  { id: 'hedefler', label: 'Hedefler', icon: '🎯' },
  { id: 'rozetler', label: 'Rozetler', icon: '🏆' },
  { id: 'ayarlar', label: 'Ayarlar', icon: '⚙️' },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedLevel,
  currentTheme = 'nexora-gradient',
  onLogout,
  currentUserName,
  userEmail,
  isOpen = false,
  setIsOpen,
}: SidebarProps) {
  const isLight = currentTheme.includes('light');

  return (
    <>
      {/* MOBİLDE ARKA PLAN KARARTMASI (Menü açıkken arkaya tıklayınca kapanır) */}
      {isOpen && setIsOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`
          w-64 h-screen fixed left-0 top-0
          ${currentTheme}
          border-r
          ${isLight
            ? 'border-slate-300/60 text-slate-900'
            : 'border-white/10 text-white'}
          flex flex-col
          shadow-xl
          z-30
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* LOGO + SEVİYE */}
        <div className="px-4 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Nexora Study
            </h1>

            <div className="mt-2">
              <span
                className={`
                  inline-block
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  px-2.5
                  py-1
                  rounded-full
                  ${
                    isLight
                      ? 'bg-slate-900/10 text-slate-800'
                      : 'bg-white/20 text-white'
                  }
                `}
              >
                {selectedLevel}
              </span>
            </div>
          </div>

          {/* Mobilde menüyü kapatma çarpısı */}
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-lg p-1 rounded-lg hover:bg-white/10"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* MENÜ */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (setIsOpen) setIsOpen(false); // Mobilde bir sekmeye basınca menüyü otomatik kapatır
                }}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3.5
                  py-2.5
                  rounded-xl
                  font-medium
                  text-sm
                  transition-all
                  ${
                    isActive
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-900 shadow-md'
                      : isLight
                        ? 'hover:bg-slate-900/10 text-slate-700'
                        : 'hover:bg-white/10 text-white/90'
                  }
                `}
              >
                <span className="text-base">
                  {item.icon}
                </span>

                <span className="tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* KULLANICI + ÇIKIŞ */}
        <div
          className={`
            shrink-0
            p-3
            border-t
            ${
              isLight
                ? 'border-slate-300/60'
                : 'border-white/10'
            }
          `}
        >
          <div
            className={`
              rounded-2xl
              p-3
              backdrop-blur-md
              border
              ${
                isLight
                  ? 'bg-white/60 border-slate-300/60'
                  : 'bg-slate-950/50 border-white/10'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
                {currentUserName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* İSİM + MAIL */}
              <div className="min-w-0 flex-1">
                <div
                  className={`
                    text-[11px]
                    font-bold
                    truncate
                    ${
                      isLight
                        ? 'text-slate-900'
                        : 'text-white'
                    }
                  `}
                >
                  {currentUserName}
                </div>

                <div
                  className={`
                    text-[9px]
                    truncate
                    ${
                      isLight
                        ? 'text-slate-500'
                        : 'text-white/50'
                    }
                  `}
                >
                  {userEmail || 'Nexora öğrencisi'}
                </div>
              </div>
            </div>

            {/* ÇIKIŞ BUTONU */}
            <button
              type="button"
              onClick={onLogout}
              className="
                w-full
                mt-3
                py-2
                rounded-xl
                text-[11px]
                font-bold
                text-red-300
                bg-red-500/10
                border border-red-400/20
                hover:bg-red-500/20
                hover:text-red-200
                transition-all
              "
            >
              🚪 Çıkış Yap
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}