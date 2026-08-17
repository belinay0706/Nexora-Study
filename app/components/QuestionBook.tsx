'use client';

import React, { useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

interface Question {
  id: string;
  lesson: string;
  topic: string;
  type: 'image' | 'text';
  content: string;
  reason: string;
  status: 'unresolved' | 'resolved';
  date: string;
}

export default function QuestionBook() {
  // ------------------------------------------------------------
  // KULLANICI
  // ------------------------------------------------------------

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<'unresolved' | 'resolved'>(
      'unresolved'
    );

  const [error, setError] = useState('');

  // ------------------------------------------------------------
  // FORM
  // ------------------------------------------------------------

  const [lesson, setLesson] =
    useState('Matematik');

  const [topic, setTopic] =
    useState('');

  const [questionType, setQuestionType] =
    useState<'text' | 'image'>('text');

  const [questionContent, setQuestionContent] =
    useState('');

  const [reason, setReason] =
    useState('Konuyu bilmiyorum');

  // ------------------------------------------------------------
  // SEÇENEKLER
  // ------------------------------------------------------------

  const lessons = [
    'Matematik',
    'Türkçe',
    'Fen Bilimleri',
    'İnkılap Tarihi',
    'Din Kültürü',
    'İngilizce',
  ];

  const reasons = [
    'Konuyu bilmiyorum',
    'Formülü bilmiyorum',
    'İşlem hatası',
    'Soruyu anlayamadım',
    'Dikkatsizlik',
    'Zaman yetmedi',
    'Diğer',
  ];

  // ------------------------------------------------------------
  // FIREBASE'DEN SORULARI ANLIK (ONSNAPSHOT) YÜKLE
  //
  // users/{uid}/questions/{questionId}
  // ------------------------------------------------------------

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }

        if (!firebaseUser) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError('');

          const questionsRef =
            collection(
              db,
              'users',
              firebaseUser.uid,
              'questions'
            );

          unsubscribeSnapshot = onSnapshot(
            questionsRef,
            (snapshot) => {
              const loadedQuestions: Question[] =
                snapshot.docs.map((questionDoc) => {
                  const data =
                    questionDoc.data();

                  return {
                    id: questionDoc.id,
                    lesson:
                      typeof data.lesson === 'string'
                        ? data.lesson
                        : 'Matematik',
                    topic:
                      typeof data.topic === 'string'
                        ? data.topic
                        : '',
                    type:
                      data.type === 'image'
                        ? 'image'
                        : 'text',
                    content:
                      typeof data.content === 'string'
                        ? data.content
                        : '',
                    reason:
                      typeof data.reason === 'string'
                        ? data.reason
                        : 'Diğer',
                    status:
                      data.status === 'resolved'
                        ? 'resolved'
                        : 'unresolved',
                    date:
                      typeof data.date === 'string'
                        ? data.date
                        : '',
                  };
                });

              loadedQuestions.sort(
                (a, b) =>
                  Number(b.id) - Number(a.id)
              );

              setQuestions(loadedQuestions);
              setLoading(false);
            },
            (firebaseError) => {
              console.error(
                'Sorular dinlenirken hata oluştu:',
                firebaseError
              );
              setError(
                'Sorular Firebase üzerinden yüklenemedi.'
              );
              setLoading(false);
            }
          );
        } catch (firebaseError) {
          console.error(
            'Bağlantı kurulamadı:',
            firebaseError
          );
          setError(
            'Sorular yüklenirken bir hata oluştu.'
          );
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // ------------------------------------------------------------
  // YENİ SORU EKLE
  // ------------------------------------------------------------

  const handleAddQuestion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !topic.trim() ||
      !questionContent.trim()
    ) {
      alert(
        'Lütfen konu ve soru içeriğini doldurun!'
      );
      return;
    }

    if (!user) {
      alert(
        'Soru kaydetmek için giriş yapmalısın.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const questionId =
        Date.now().toString();

      const newQuestion: Question = {
        id: questionId,
        lesson,
        topic: topic.trim(),
        type: questionType,
        content: questionContent,
        reason,
        status: 'unresolved',
        date:
          new Date().toLocaleDateString(
            'tr-TR'
          ),
      };

      const questionRef =
        doc(
          db,
          'users',
          user.uid,
          'questions',
          questionId
        );

      await setDoc(
        questionRef,
        {
          lesson: newQuestion.lesson,
          topic: newQuestion.topic,
          type: newQuestion.type,
          content: newQuestion.content,
          reason: newQuestion.reason,
          status: newQuestion.status,
          date: newQuestion.date,
        }
      );

      setTopic('');
      setQuestionContent('');
      setIsModalOpen(false);
    } catch (firebaseError) {
      console.error(
        'Soru Firebase\'e kaydedilemedi:',
        firebaseError
      );

      setError(
        'Soru Firebase\'e kaydedilemedi.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // SORUYU ÇÖZÜLDÜ / ÇÖZÜLMEDİ YAP
  // ------------------------------------------------------------

  const toggleStatus = async (
    id: string
  ) => {
    if (!user) {
      return;
    }

    const question =
      questions.find(
        (item) => item.id === id
      );

    if (!question) {
      return;
    }

    const newStatus =
      question.status === 'unresolved'
        ? 'resolved'
        : 'unresolved';

    try {
      setSaving(true);
      setError('');

      const questionRef =
        doc(
          db,
          'users',
          user.uid,
          'questions',
          id
        );

      await updateDoc(
        questionRef,
        {
          status: newStatus,
        }
      );
    } catch (firebaseError) {
      console.error(
        'Soru durumu güncellenemedi:',
        firebaseError
      );

      setError(
        'Soru durumu Firebase üzerinde güncellenemedi.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // SORU SİL
  // ------------------------------------------------------------

  const deleteQuestion = async (
    id: string
  ) => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const questionRef =
        doc(
          db,
          'users',
          user.uid,
          'questions',
          id
        );

      await deleteDoc(
        questionRef
      );
    } catch (firebaseError) {
      console.error(
        'Soru silinemedi:',
        firebaseError
      );

      setError(
        'Soru Firebase üzerinden silinemedi.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // FOTOĞRAF YÜKLEME
  // ------------------------------------------------------------

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onloadend = () => {
      setQuestionContent(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  };

  // ------------------------------------------------------------
  // FİLTRE
  // ------------------------------------------------------------

  const filteredQuestions =
    questions.filter(
      (question) =>
        activeTab === 'unresolved'
          ? question.status ===
            'unresolved'
          : question.status ===
            'resolved'
    );

  // ------------------------------------------------------------
  // YÜKLENİYOR
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="bg-white/90 rounded-3xl p-8 shadow-xl border border-amber-200 text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-amber-100 border-t-amber-700 animate-spin" />

          <p className="font-bold text-amber-950">
            Sorular yükleniyor...
          </p>

          <p className="text-xs text-gray-500 mt-2">
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
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="bg-white/90 rounded-3xl p-8 shadow-xl border border-amber-200 text-center">
          <div className="text-4xl mb-4">
            🔐
          </div>

          <h2 className="text-xl font-extrabold text-amber-950">
            Yapamadığım Sorular
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Sorularını görmek için giriş yapmalısın.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // SAYFA
  // ------------------------------------------------------------

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">

      {/* BAŞLIK */}

      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-amber-200/60 flex flex-col md:flex-row justify-between items-center gap-4">

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700/70">
            Hata Analizi
          </span>

          <h1 className="text-2xl font-extrabold text-amber-950">
            ❌ Yapamadığım Sorular
          </h1>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsModalOpen(true)
          }
          className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 flex items-center gap-2"
        >
          <span>
            + Soru Ekle
          </span>
        </button>
      </div>

      {/* HATA */}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* KAYDEDİLİYOR */}

      {saving && (
        <div className="text-center text-xs font-semibold text-amber-700">
          ⏳ Firebase ile senkronize ediliyor...
        </div>
      )}

      {/* SEKME */}

      <div className="flex gap-2 border-b border-amber-900/10 pb-2">

        <button
          type="button"
          onClick={() =>
            setActiveTab('unresolved')
          }
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab ===
            'unresolved'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white/60 text-amber-900 hover:bg-amber-100'
          }`}
        >
          🔴 Çözülmedi (
          {
            questions.filter(
              (q) =>
                q.status ===
                'unresolved'
            ).length
          }
          )
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab('resolved')
          }
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab ===
            'resolved'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white/60 text-amber-900 hover:bg-amber-100'
          }`}
        >
          🟢 Çözüldü Arşivi (
          {
            questions.filter(
              (q) =>
                q.status ===
                'resolved'
            ).length
          }
          )
        </button>

      </div>

      {/* SORU LİSTESİ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {filteredQuestions.length ===
        0 ? (
          <div className="col-span-full text-center py-16 bg-white/60 rounded-2xl border border-dashed border-amber-200 text-amber-800/60 font-medium">
            Bu kategoride henüz soru bulunmuyor.
            Harika gidiyorsun! ✨
          </div>
        ) : (
          filteredQuestions.map(
            (q) => (
              <div
                key={q.id}
                className="bg-white/90 rounded-2xl p-5 shadow-sm border border-amber-200/80 flex flex-col justify-between space-y-4"
              >

                <div className="space-y-2">

                  <div className="flex justify-between items-center">

                    <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg">
                      {q.lesson}
                    </span>

                    <span className="text-xs text-gray-400">
                      {q.date}
                    </span>

                  </div>

                  <h3 className="text-lg font-extrabold text-gray-900">
                    Konu: {q.topic}
                  </h3>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-800">

                    {q.type ===
                    'text' ? (
                      <p className="whitespace-pre-wrap">
                        {q.content}
                      </p>
                    ) : (
                      <img
                        src={q.content}
                        alt="Soru Görseli"
                        className="max-h-48 rounded-lg mx-auto object-contain"
                      />
                    )}

                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 w-fit">
                    <span>
                      ⚠️ Hata Nedeni:{' '}
                      {q.reason}
                    </span>
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      toggleStatus(q.id)
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      q.status ===
                      'unresolved'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    } disabled:opacity-50`}
                  >
                    {q.status ===
                    'unresolved'
                      ? 'Çözdüm ✓'
                      : 'Tekrar Çalış ↺'}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      deleteQuestion(
                        q.id
                      )
                    }
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold disabled:opacity-50"
                  >
                    Sil
                  </button>

                </div>

              </div>
            )
          )
        )}

      </div>

      {/* MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center border-b pb-4">

              <h2 className="text-xl font-extrabold text-amber-950">
                📝 Yeni Yapılamayan Soru Ekle
              </h2>

              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={
                handleAddQuestion
              }
              className="space-y-4"
            >

              {/* DERS */}

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Ders Seç
                </label>

                <select
                  value={lesson}
                  onChange={(e) =>
                    setLesson(
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {lessons.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* KONU */}

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Konu Adı
                </label>

                <input
                  type="text"
                  placeholder="Örn: Türev, Üslü Sayılar, Paragraf..."
                  value={topic}
                  onChange={(e) =>
                    setTopic(
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* TİP */}

              <div>

                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Soru Ekleme Yöntemi
                </label>

                <div className="flex gap-2 mb-2">

                  <button
                    type="button"
                    onClick={() =>
                      setQuestionType(
                        'text'
                      )
                    }
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${
                      questionType ===
                      'text'
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    ✍️ Soruyu Yaz
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setQuestionType(
                        'image'
                      )
                    }
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${
                      questionType ===
                      'image'
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    📷 Fotoğraf Yükle
                  </button>

                </div>

                {questionType ===
                'text' ? (
                  <textarea
                    rows={4}
                    placeholder="Sorunun metnini buraya yaz..."
                    value={
                      questionContent
                    }
                    onChange={(e) =>
                      setQuestionContent(
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                ) : (
                  <div className="space-y-2">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                    />

                    {questionContent && (
                      <div className="text-xs text-emerald-600 font-bold">
                        ✓ Fotoğraf başarıyla yüklendi!
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* NEDEN */}

              <div>

                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Neden Yapamadın?
                </label>

                <select
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {reasons.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* KAYDET */}

              <div className="pt-2">

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving
                    ? 'Kaydediliyor...'
                    : 'Soruyu Kaydet 🎯'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}