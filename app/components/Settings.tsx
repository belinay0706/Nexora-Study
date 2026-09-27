'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface SettingsProps {
  currentTheme: string;
  setTheme: (theme: string) => void;
}

const themes = [
  // 🌟 Belora Özel
  { id: 'belora-gradient', name: 'Belora Özel', type: 'Özel', color: 'bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400' },
  
  // 🌙 Koyu Tema
  { id: 'theme-dark', name: 'Koyu Tema (Dark)', type: 'Koyu', color: 'bg-slate-900' },

  // 🔴 Kırmızı
  { id: 'theme-dark-red', name: 'Koyu Kırmızı', type: 'Koyu', color: 'bg-red-800' },
  { id: 'theme-light-red', name: 'Açık Kırmızı', type: 'Açık', color: 'bg-red-100' },

  // 🟠 Turuncu
  { id: 'theme-dark-orange', name: 'Koyu Turuncu', type: 'Koyu', color: 'bg-orange-700' },
  { id: 'theme-light-orange', name: 'Açık Turuncu', type: 'Açık', color: 'bg-orange-100' },

  // 🟡 Sarı
  { id: 'theme-dark-yellow', name: 'Koyu Sarı', type: 'Koyu', color: 'bg-amber-600' },
  { id: 'theme-light-yellow', name: 'Açık Sarı', type: 'Açık', color: 'bg-amber-100' },

  // 🟢 Yeşil
  { id: 'theme-dark-green', name: 'Koyu Yeşil', type: 'Koyu', color: 'bg-emerald-800' },
  { id: 'theme-light-green', name: 'Açık Yeşil', type: 'Açık', color: 'bg-emerald-100' },

  // 🔵 Mavi
  { id: 'theme-dark-blue', name: 'Koyu Mavi', type: 'Koyu', color: 'bg-blue-800' },
  { id: 'theme-light-blue', name: 'Açık Mavi', type: 'Açık', color: 'bg-sky-100' },

  // 🟣 Mor
  { id: 'theme-dark-purple', name: 'Koyu Mor', type: 'Koyu', color: 'bg-purple-800' },
  { id: 'theme-light-purple', name: 'Açık Mor', type: 'Açık', color: 'bg-purple-100' },

  // 🌸 Pembe
  { id: 'theme-dark-pink', name: 'Koyu Pembe', type: 'Koyu', color: 'bg-pink-800' },
  { id: 'theme-light-pink', name: 'Açık Pembe', type: 'Açık', color: 'bg-pink-100' },
];

const departments = [
  'YKS Hazırlık',
  'Beslenme ve Diyetetik',
  'Bilgisayar Mühendisliği',
  'Biyomedikal Mühendisliği',
  'Diş Hekimliği Fakültesi',
  'Ebelik',
  'Elektrik Elektronik Müh.',
  'Endüstri Mühendisliği',
  'Endüstriyel Tasarım',
  'Havacılık ve Uzay Müh.',
  'Hemşirelik Fakültesi',
  'Hukuk Fakültesi',
  'İngilizce Öğretmenliği',
  'İnşaat Mühendisliği',
  'Makine Mühendisliği',
  'Tıp Fakültesi',
  'Yazılım Mühendisliği'
];

const grades = [
  'Hazırlık',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf (İntörn)',
  'Mezun'
];

export default function Settings({ currentTheme, setTheme }: SettingsProps) {
  const [department, setDepartment] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // Kullanıcının mevcut verilerini veritabanından çekme
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.department) setDepartment(data.department);
            if (data.grade) setGrade(data.grade);
          }
        } catch (error) {
          console.error("Kullanıcı verileri çekilemedi:", error);
        }
      }
      setFetching(false);
    };

    fetchUserData();
  }, []);

  // Profil Güncelleme
  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage('❌ Lütfen önce giriş yapın.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        department: department,
        grade: grade,
      });

      setMessage('✨ Bölüm ve sınıf bilgin başarıyla güncellendi!');
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage('❌ Güncelleme yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      
      {/* 🎓 Bölüm & Sınıf Ayarları Kartı */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🎓</span> Profil ve Öğrenim Bilgileri
        </h1>
        <p className="text-xs text-slate-500">
          Yanlış bölüm veya sınıf mı seçtin? Buradan anında düzeltebilirsin.
        </p>

        {fetching ? (
          <div className="text-xs text-slate-400 animate-pulse">Bilgiler yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Bölüm Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bölümün
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none transition"
              >
                <option value="">Bölüm Seçin...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Sınıf Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sınıfın
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none transition"
              >
                <option value="">Sınıf Seçin...</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

          </div>
        )}

        {/* Kaydet Butonu ve Bildirim */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleProfileUpdate}
            disabled={loading || fetching}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Kaydedidliyor...' : 'Bilgileri Güncelle'}
          </button>

          {message && (
            <span className="text-xs font-medium text-slate-700 transition-all">
              {message}
            </span>
          )}
        </div>
      </div>

      {/* ⚙️ Üst Tema Bilgi Kartı */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>⚙️</span> Görünüm ve Tema Ayarları
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          İstediğin tüm koyu/açık renk tonlarını ve Belora'ya özel temaları buradan anında seçebilirsin.
        </p>
      </div>

      {/* Tema Seçim Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between shadow-xs cursor-pointer ${
              currentTheme === t.id
                ? 'border-teal-500 ring-2 ring-teal-400 bg-white'
                : 'border-slate-200/80 bg-white/80 hover:bg-white'
            }`}
          >
            <div>
              <div className="font-bold text-slate-900 text-sm">{t.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">Tür: {t.type}</div>
            </div>
            {/* Ön İzleme Renk Dairesi */}
            <div className={`w-7 h-7 rounded-xl ${t.color} border border-black/10 shadow-inner flex-shrink-0`}></div>
          </button>
        ))}
      </div>
    </div>
  );
}