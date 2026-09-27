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

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function QuickNotes() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setNotes([]);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setError('');

          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const firebaseNotes = Array.isArray(data.quickNotes)
              ? (data.quickNotes as Note[])
              : [];

            setNotes(firebaseNotes);
          } else {
            setNotes([]);
          }
        } catch (firebaseError) {
          console.error('Hızlı notlar yüklenemedi:', firebaseError);
          setError('Hızlı notlar Firebase üzerinden yüklenemedi.');
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const saveNotesToFirebase = async (updatedNotes: Note[]): Promise<boolean> => {
    if (!user) return false;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          quickNotes: updatedNotes,
          noteCount: updatedNotes.length, // 🏅 Rozetler sayfasının okuduğu sayaç!
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch (firebaseError) {
      console.error('Notlar Firebase\'e kaydedilemedi:', firebaseError);
      setError('Not kaydedilemedi, bağlantını kontrol et.');
      return false;
    }
  };

  const handleAddOrUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !content.trim()) {
      return;
    }

    if (!user) {
      setError('Not oluşturmak için giriş yapmalısın.');
      return;
    }

    setError('');

    let updatedNotes: Note[] = [];

    if (isEditing) {
      updatedNotes = notes.map((note) =>
        note.id === isEditing
          ? {
              ...note,
              title: title.trim() || 'Başlıksız Not',
              content,
            }
          : note
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || 'Başlıksız Not',
        content,
        date: new Date().toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      updatedNotes = [newNote, ...notes];
    }

    // Önce Firebase'e kaydet, başarıyla kaydedilirse ekrana yansıt
    const success = await saveNotesToFirebase(updatedNotes);
    if (!success) return;

    setNotes(updatedNotes);
    setIsEditing(null);
    setTitle('');
    setContent('');

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1000);
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(note.id);
  };

  const handleDelete = async (id: string) => {
    const filtered = notes.filter((note) => note.id !== id);
    const success = await saveNotesToFirebase(filtered);
    if (success) {
      setNotes(filtered);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-700">
            Notların yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-1xl font-bold text-gray-800 mb-2">
          Hızlı Notlar
        </h2>
        <p className="text-sm text-gray-500">
          Notlarını kullanmak için giriş yapmalısın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Not Ekleme & Liste Paneli */}
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span>📌</span>
            Hızlı Notlarım
          </h2>
          <div className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            {notes.length} Aktif Not
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAddOrUpdateNote} className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Not başlığı ekle..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400"
          />

          <textarea
            placeholder="Düşüncelerini buraya not et..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400 resize-none"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 py-3 rounded-2xl font-bold transition-all shadow-lg cursor-pointer ${
                showSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
              }`}
            >
              {showSuccess ? 'Kaydedildi! ✨' : isEditing ? 'Notu Güncelle' : 'Notu Kaydet'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(null);
                  setTitle('');
                  setContent('');
                }}
                className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition cursor-pointer"
              >
                İptal
              </button>
            )}
          </div>
        </form>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <p className="font-bold text-gray-700">
              Henüz notun yok.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              İlk notunu oluşturarak başla.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-gray-800 mb-2">
                  {note.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                  <span>{note.date}</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="text-purple-600 font-medium cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="text-rose-500 font-medium cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧠 Kalıcı Öğrenme İçin Etkili Not Alma Rehberi */}
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 text-gray-700 space-y-6">
        <div className="border-b border-purple-100 pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🧠</span> Kalıcı Öğrenme İçin Etkili Not Alma Metotları
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Not almak sadece duyulanı veya okunanı aynen kopyalamak değildir; bilgiyi zihinde işleyip anlamlandırma sürecidir.
          </p>
        </div>

        <p className="text-xs leading-relaxed text-gray-600">
          Akademik çalışmalarda en sık yapılan hata, pasif not alma adı verilen metnin birebir aynısını yazma alışkanlığıdır. Bilişsel psikoloji araştırmaları, kendi kelimelerinizle özetleyerek yapılan <strong>aktif not alma</strong> süreçlerinin hatırlama oranını %80'e kadar çıkardığını göstermektedir. Notlarınızdan maksimum verim almak için uygulayabileceğiniz bilimsel teknikler şunlardır:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white/80 border border-purple-50 space-y-1.5 shadow-xs">
            <h3 className="font-bold text-xs text-purple-900 flex items-center gap-2">
              <span>📐</span> Cornell Not Sistemi
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-600">
              Sayfanızı üç bölüme ayırın: Notlar, Anahtar Kavramlar/Sorular ve Özet. Çalışma bittikten hemen sonra alt kısma çıkarılan 2 cümlelik özet, zihnin ana fikri kavramasını sağlar ve tekrar yaparken süreyi inanılmaz kısaltır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-purple-50 space-y-1.5 shadow-xs">
            <h3 className="font-bold text-xs text-purple-900 flex items-center gap-2">
              <span>🗣️</span> Feynman Tekniği ile Not Alma
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-600">
              Öğrendiğiniz bir kavramı, konuyu hiç bilmeyen 10 yaşındaki bir çocuğa anlatıyormuş gibi en basit haliyle not edin. Karmaşık terimlerden kaçınıp kendi basit cümlelerinizi kurduğunuzda, tam olarak nerede tıkandığınızı anlarsınız.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-purple-50 space-y-1.5 shadow-xs">
            <h3 className="font-bold text-xs text-purple-900 flex items-center gap-2">
              <span>🗺️</span> Zihin Haritaları (Mind Mapping)
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-600">
              Lineer ve düz yazılar yerine, merkezde ana konu olacak şekilde dallanıp budaklanan şemalar çizin. Görsel hafızayı ve sağ-sol beyin loblarını aynı anda tetiklemek bağlantı kurmayı kolaylaştırır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-purple-50 space-y-1.5 shadow-xs">
            <h3 className="font-bold text-xs text-purple-900 flex items-center gap-2">
              <span>🎨</span> Renk Kodlama & Sembol Kullanımı
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-600">
              Sadece 2-3 farklı renk belirleyin: Örn. Tanımlar için mavi, Sınav soruları için kırmızı, Önemli ipuçları için yeşil. Aşırı renk kullanımı dikkati dağıtırken, kurgulanmış renk kodları görsel aramayı hızlandırır.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 text-[11px] text-purple-900 font-medium leading-relaxed">
          💡 <strong>Altın Kural (24 Saat İçinde Gözden Geçirme):</strong> Tutulan bir not, alındığı ilk 24 saat içinde 5 dakikalık hızlı bir okumayla tekrar edilmezse bilginin %60'ı kaybolur. Notlarınızı düzenli olarak hızlı gözden geçirin!
        </div>
      </div>
    </div>
  );
}