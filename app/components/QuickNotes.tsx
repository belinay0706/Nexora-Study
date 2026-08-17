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

  const [isEditing, setIsEditing] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /*
   * ============================================================
   * FIREBASE + AUTH
   * ============================================================
   */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
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

            const userRef = doc(
              db,
              'users',
              firebaseUser.uid
            );

            const userSnap =
              await getDoc(userRef);

            if (userSnap.exists()) {
              const data =
                userSnap.data();

              const firebaseNotes =
                Array.isArray(data.quickNotes)
                  ? (data.quickNotes as Note[])
                  : [];

              setNotes(firebaseNotes);
            } else {
              setNotes([]);
            }
          } catch (firebaseError) {
            console.error(
              'Hızlı notlar yüklenemedi:',
              firebaseError
            );

            setError(
              'Hızlı notlar Firebase üzerinden yüklenemedi.'
            );
          } finally {
            setIsLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  /*
   * ============================================================
   * NOTLARI FIREBASE'E KAYDET
   * ============================================================
   */

  const saveNotesToFirebase =
    async (updatedNotes: Note[]) => {
      if (!user) {
        return false;
      }

      try {
        const userRef = doc(
          db,
          'users',
          user.uid
        );

        await setDoc(
          userRef,
          {
            quickNotes: updatedNotes,
            updatedAt: new Date(),
          },
          {
            merge: true,
          }
        );

        setNotes(updatedNotes);

        return true;
      } catch (firebaseError) {
        console.error(
          'Notlar Firebase\'e kaydedilemedi:',
          firebaseError
        );

        setError(
          'Not Firebase\'e kaydedilemedi.'
        );

        return false;
      }
    };

  /*
   * ============================================================
   * NOT EKLE / GÜNCELLE
   * ============================================================
   */

  const handleAddOrUpdateNote =
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (
        !title.trim() &&
        !content.trim()
      ) {
        return;
      }

      if (!user) {
        setError(
          'Not oluşturmak için giriş yapmalısın.'
        );

        return;
      }

      setError('');

      /*
       * ========================================================
       * MEVCUT NOTU GÜNCELLE
       * ========================================================
       */

      if (isEditing) {
        const updated =
          notes.map((note) =>
            note.id === isEditing
              ? {
                  ...note,
                  title:
                    title.trim() ||
                    'Başlıksız Not',
                  content,
                }
              : note
          );

        const saved =
          await saveNotesToFirebase(
            updated
          );

        if (saved) {
          setIsEditing(null);
          setTitle('');
          setContent('');
        }

        return;
      }

      /*
       * ========================================================
       * YENİ NOT OLUŞTUR
       * ========================================================
       */

      const newNote: Note = {
        id: Date.now().toString(),

        title:
          title.trim() ||
          'Başlıksız Not',

        content,

        date:
          new Date().toLocaleDateString(
            'tr-TR',
            {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }
          ),
      };

      const updatedNotes = [
        newNote,
        ...notes,
      ];

      try {
        const userRef = doc(
          db,
          'users',
          user.uid
        );

        const userSnap =
          await getDoc(userRef);

        const existingData =
          userSnap.exists()
            ? userSnap.data()
            : {};

        const currentCreatedCount =
          typeof existingData.quickNotesCreatedCount ===
          'number'
            ? existingData.quickNotesCreatedCount
            : 0;

        /*
         * ÖNEMLİ:
         *
         * Bu sayı oluşturulan toplam not sayısıdır.
         *
         * Not sonradan silinse bile
         * bu sayı azalmaz.
         *
         * Böylece rozet sistemi gerçek
         * ilerlemeyi takip eder.
         */

        const newCreatedCount =
          currentCreatedCount + 1;

        await setDoc(
          userRef,
          {
            quickNotes:
              updatedNotes,

            quickNotesCreatedCount:
              newCreatedCount,

            updatedAt:
              new Date(),
          },
          {
            merge: true,
          }
        );

        setNotes(updatedNotes);

        setTitle('');
        setContent('');
      } catch (firebaseError) {
        console.error(
          'Yeni not Firebase\'e kaydedilemedi:',
          firebaseError
        );

        setError(
          'Yeni not Firebase\'e kaydedilemedi.'
        );
      }
    };

  /*
   * ============================================================
   * NOT DÜZENLE
   * ============================================================
   */

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(note.id);
  };

  /*
   * ============================================================
   * NOT SİL
   * ============================================================
   */

  const handleDelete =
    async (id: string) => {
      const filtered =
        notes.filter(
          (note) =>
            note.id !== id
        );

      await saveNotesToFirebase(
        filtered
      );
    };

  /*
   * ============================================================
   * YÜKLENİYOR
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 flex items-center justify-center min-h-[300px]">

        <div className="text-center">

          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

          <p className="text-sm font-semibold text-gray-700">
            Notların yükleniyor...
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Firebase verileri kontrol ediliyor.
          </p>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * GİRİŞ YOK
   * ============================================================
   */

  if (!user) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50 text-center">

        <div className="text-4xl mb-4">
          🔐
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Hızlı Notlar
        </h2>

        <p className="text-sm text-gray-500">
          Notlarını kullanmak için
          giriş yapmalısın.
        </p>

      </div>
    );
  }

  /*
   * ============================================================
   * SAYFA
   * ============================================================
   */

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50">

      {/* BAŞLIK */}

      <div className="flex items-center justify-between mb-8">

        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span>📌</span>
          Hızlı Notlarım
        </h2>

        <div className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold">
          {notes.length} Aktif Not
        </div>

      </div>

      {/* HATA */}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={
          handleAddOrUpdateNote
        }
        className="mb-8 space-y-4"
      >

        <input
          type="text"
          placeholder="Not başlığı ekle..."
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400"
        />

        <textarea
          placeholder="Düşüncelerini buraya not et..."
          value={content}
          onChange={(e) =>
            setContent(
              e.target.value
            )
          }
          rows={3}
          className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400 resize-none"
        />

        <div className="flex gap-3">

          <button
            type="submit"
            className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
          >
            {isEditing
              ? 'Notu Güncelle'
              : 'Notu Kaydet'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(null);
                setTitle('');
                setContent('');
              }}
              className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
            >
              İptal
            </button>
          )}

        </div>

      </form>

      {/* NOTLAR */}

      {notes.length === 0 ? (

        <div className="text-center py-12">

          <div className="text-5xl mb-4">
            📝
          </div>

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

                <span>
                  {note.date}
                </span>

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(note)
                    }
                    className="text-purple-600 font-medium"
                  >
                    Düzenle
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        note.id
                      )
                    }
                    className="text-rose-500 font-medium"
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
  );
}