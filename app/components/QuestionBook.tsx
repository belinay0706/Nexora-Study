'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  lesson: string;
  topic: string;
  type: 'image' | 'text';
  content: string; // Soru görsel URL'i veya metni
  reason: string;
  status: 'unresolved' | 'resolved';
  date: string;
}

export default function QuestionBook() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unresolved' | 'resolved'>('unresolved');

  // Form State'leri
  const [lesson, setLesson] = useState('Matematik');
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState<'text' | 'image'>('text');
  const [questionContent, setQuestionContent] = useState('');
  const [reason, setReason] = useState('Konuyu bilmiyorum');

  const lessons = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'İnkılap Tarihi', 'Din Kültürü', 'İngilizce'];
  
  const reasons = [
    'Konuyu bilmiyorum',
    'Formülü bilmiyorum',
    'İşlem hatası',
    'Soruyu anlayamadım',
    'Dikkatsizlik',
    'Zaman yetmedi',
    'Diğer'
  ];

  // LocalStorage'dan yükleme
  useEffect(() => {
    const saved = localStorage.getItem('nexore_question_book');
    if (saved) {
      try {
        setQuestions(JSON.parse(saved));
      } catch (e) {
        console.error("Sorular yüklenemedi", e);
      }
    }
  }, []);

  const saveToStorage = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    localStorage.setItem('nexore_question_book', JSON.stringify(newQuestions));
  };

  // Yeni Soru Ekleme
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !questionContent.trim()) {
      alert('Lütfen konu ve soru içeriğini doldurun!');
      return;
    }

    const newQ: Question = {
      id: Date.now().toString(),
      lesson,
      topic,
      type: questionType,
      content: questionContent,
      reason,
      status: 'unresolved',
      date: new Date().toLocaleDateString('tr-TR'),
    };

    saveToStorage([newQ, ...questions]);
    setTopic('');
    setQuestionContent('');
    setIsModalOpen(false);
  };

  // Çözüldü İşaretleme (Arşive Gönderme)
  const toggleStatus = (id: string) => {
    const updated = questions.map(q => {
      if (q.id === id) {
        return { ...q, status: (q.status === 'unresolved' ? 'resolved' : 'unresolved') as 'unresolved' | 'resolved' };
      }
      return q;
    });
    saveToStorage(updated);
  };

  // Soru Silme
  const deleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    saveToStorage(updated);
  };

  // Simüle edilmiş fotoğraf yükleme
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionContent(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredQuestions = questions.filter(q => activeTab === 'unresolved' ? q.status === 'unresolved' : q.status === 'resolved');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Üst Başlık ve Soru Ekle Butonu */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-amber-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700/70">Hata Analizi</span>
          <h1 className="text-2xl font-extrabold text-amber-950">❌ Yapamadığım Sorular</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 flex items-center gap-2"
        >
          <span>+ Soru Ekle</span>
        </button>
      </div>

      {/* Sekmeler (Çözülmeyenler / Çözülenler Arşivi) */}
      <div className="flex gap-2 border-b border-amber-900/10 pb-2">
        <button
          onClick={() => setActiveTab('unresolved')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'unresolved'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white/60 text-amber-900 hover:bg-amber-100'
          }`}
        >
          🔴 Çözülmedi ({questions.filter(q => q.status === 'unresolved').length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'resolved'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white/60 text-amber-900 hover:bg-amber-100'
          }`}
        >
          🟢 Çözüldü Arşivi ({questions.filter(q => q.status === 'resolved').length})
        </button>
      </div>

      {/* Soru Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white/60 rounded-2xl border border-dashed border-amber-200 text-amber-800/60 font-medium">
            Bu kategoride henüz soru bulunmuyor. Harika gidiyorsun! ✨
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white/90 rounded-2xl p-5 shadow-sm border border-amber-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg">
                    {q.lesson}
                  </span>
                  <span className="text-xs text-gray-400">{q.date}</span>
                </div>
                
                <h3 className="text-lg font-extrabold text-gray-900">Konu: {q.topic}</h3>
                
                {/* Soru İçeriği (Yazı veya Görsel) */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-800">
                  {q.type === 'text' ? (
                    <p className="whitespace-pre-wrap">{q.content}</p>
                  ) : (
                    <img src={q.content} alt="Soru Görseli" className="max-h-48 rounded-lg mx-auto object-contain" />
                  )}
                </div>

                {/* Neden Yapamadım Etiketi */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 w-fit">
                  <span>⚠️ Hata Nedeni: {q.reason}</span>
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleStatus(q.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    q.status === 'unresolved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                  }`}
                >
                  {q.status === 'unresolved' ? 'Çözdüm ✓' : 'Tekrar Çalış ↺'}
                </button>

                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Soru Ekleme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-extrabold text-amber-950">📝 Yeni Yapılamayan Soru Ekle</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              {/* Ders Seçimi */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Ders Seç</label>
                <select
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {lessons.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Konu */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Konu Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Türev, Üslü Sayılar, Paragraf..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Soru Tipi (Fotoğraf veya Yazı) */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Soru Ekleme Yöntemi</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setQuestionType('text')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${questionType === 'text' ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    ✍️ Soruyu Yaz
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionType('image')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${questionType === 'image' ? 'bg-amber-700 text-white border-amber-700' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    📷 Fotoğraf Yükle
                  </button>
                </div>

                {questionType === 'text' ? (
                  <textarea
                    rows={4}
                    placeholder="Sorunun metnini buraya yaz..."
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                    />
                    {questionContent && (
                      <div className="text-xs text-emerald-600 font-bold">✓ Fotoğraf başarıyla yüklendi!</div>
                    )}
                  </div>
                )}
              </div>

              {/* Neden Yapamadım Seçimi */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Neden Yapamadın?</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {reasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Kaydet Butonu */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Soruyu Kaydet 🎯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}