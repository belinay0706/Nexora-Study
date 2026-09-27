'use client';

import React, { useState } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  status: 'pending' | 'learned' | 'retry';
}

export default function Flashcards() {
  const [inputText, setInputText] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // --------------------------------------------------
  // DOSYA OKUMA
  // --------------------------------------------------

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      alert(
        'Şimdilik yalnızca metin dosyaları destekleniyor. PDF desteğini ayrıca ekleyeceğiz.'
      );
      return;
    }

    try {
      setIsLoading(true);

      const text = await file.text();

      if (!text.trim()) {
        alert('Dosyanın içinde okunabilir bir metin bulunamadı.');
        return;
      }

      setInputText(text);

      await generateFlashcards(text);
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      alert('Dosya okunurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // FLASHCARD OLUŞTURMA
  // --------------------------------------------------

  const generateFlashcards = async (sourceText?: string) => {
    const textToProcess = sourceText ?? inputText;

    if (!textToProcess.trim()) {
      alert('Lütfen çalışmak istediğin bir metin gir.');
      return;
    }

    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToProcess.slice(0, 12000),
        }),
      });

      // 🛑 GELEN YANITIN JSON OLUP OLMADIĞINI KONTROL ET
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'Sunucudan geçerli bir yanıt alınamadı (Sunucu hatası veya zaman aşımı). Lütfen tekrar deneyin.'
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Flashcard oluşturulurken bir hata oluştu.'
        );
      }

      if (!Array.isArray(data.cards)) {
        throw new Error('Yapay zeka geçerli bir kart listesi döndürmedi.');
      }

      const formattedCards: Flashcard[] = data.cards
        .filter(
          (card: { question?: string; answer?: string }) =>
            card.question?.trim() && card.answer?.trim()
        )
        .map(
          (
            card: { question: string; answer: string },
            index: number
          ) => ({
            id: index + 1,
            question: card.question,
            answer: card.answer,
            status: 'pending',
          })
        );

      if (formattedCards.length === 0) {
        throw new Error('Kart oluşturulamadı. Metni biraz daha açıklayıcı deneyin.');
      }

      setCards(formattedCards);
    } catch (error: unknown) {
      console.error('Flashcard üretim hatası:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Bilinmeyen bir hata oluştu.';

      alert(`Kartlar oluşturulamadı: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // KART CEVABI
  // --------------------------------------------------

  const handleResponse = (status: 'learned' | 'retry') => {
    const updatedCards = cards.map((card, index) =>
      index === currentIndex ? { ...card, status } : card
    );

    setCards(updatedCards);
    setIsFlipped(false);

    // Önce sıradaki öğrenilmemiş karta git
    const nextPendingIndex = updatedCards.findIndex(
      (card, index) =>
        index > currentIndex && card.status !== 'learned'
    );

    if (nextPendingIndex !== -1) {
      setCurrentIndex(nextPendingIndex);
      return;
    }

    // Baştan öğrenilmemiş kart ara
    const firstPendingIndex = updatedCards.findIndex(
      (card) => card.status !== 'learned'
    );

    if (firstPendingIndex !== -1) {
      setCurrentIndex(firstPendingIndex);
    }
  };

  // --------------------------------------------------
  // YENİ KONU
  // --------------------------------------------------

  const resetCards = () => {
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setInputText('');
  };

  const currentCard = cards[currentIndex];

  const learnedCount = cards.filter(
    (card) => card.status === 'learned'
  ).length;

  const isCompleted =
    cards.length > 0 && learnedCount === cards.length;

  // --------------------------------------------------
  // ARAYÜZ
  // --------------------------------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* BAŞLIK */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-amber-200/60 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>🎴</span>
          Yapay Zeka Flashcards
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Ders notlarını veya özetini ekle; Belora senin için
          çalışma kartları oluştursun.
        </p>
      </div>

      {/* GİRİŞ ALANI */}
      {cards.length === 0 && !isLoading && (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-amber-200/50 space-y-4 shadow-sm">

          {/* SEKME */}
          <div className="flex gap-3 border-b border-slate-100 pb-3">

            <button
              onClick={() => setActiveTab('text')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeTab === 'text'
                  ? 'bg-amber-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📝 Metin Yapıştır
            </button>

            <button
              onClick={() => setActiveTab('file')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                activeTab === 'file'
                  ? 'bg-amber-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📄 Dosya Yükle
            </button>

          </div>

          {/* METİN */}
          {activeTab === 'text' && (
            <div className="space-y-3">

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Çalışmak istediğin konu özetini veya ders notlarını buraya yapıştır..."
                className="w-full h-40 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              />

              <button
                onClick={() => void generateFlashcards()}
                disabled={!inputText.trim()}
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                ✨ Kartları Oluştur
              </button>

            </div>
          )}

          {/* DOSYA */}
          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-amber-200 rounded-2xl p-8 text-center space-y-3 bg-amber-50/30">

              <span className="text-3xl">📥</span>

              <p className="text-xs font-semibold text-slate-600">
                Kartlara dönüştürmek istediğin metin dosyasını seç
              </p>

              <p className="text-[10px] text-slate-400">
                PDF desteğini bir sonraki aşamada ekleyeceğiz.
              </p>

              <input
                type="file"
                accept=".txt,.md,.csv,.json,text/plain,text/markdown"
                onChange={handleFileUpload}
                className="hidden"
                id="flashcard-file-upload"
              />

              <label
                htmlFor="flashcard-file-upload"
                className="inline-block px-5 py-2.5 bg-amber-800 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-amber-900 transition-all shadow-sm"
              >
                Dosya Seç
              </label>

            </div>
          )}

        </div>
      )}

      {/* YÜKLENİYOR */}
      {isLoading && (
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-3xl border border-amber-200/60 text-center space-y-3">

          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-800 rounded-full animate-spin mx-auto" />

          <p className="text-xs font-bold text-slate-700">
            Yapay Zeka Notlarını Analiz Ediyor...
          </p>

          <p className="text-[10px] text-slate-400">
            Flashcard'ların hazırlanıyor.
          </p>

        </div>
      )}

      {/* KART */}
      {cards.length > 0 && !isCompleted && currentCard && (
        <div className="space-y-4">

          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2">

            <span>
              Öğrenilen: {learnedCount} / {cards.length}
            </span>

            <button
              onClick={resetCards}
              className="text-amber-800 hover:underline text-[11px] cursor-pointer"
            >
              🔄 Yeni Konu
            </button>

          </div>

          {/* FLASHCARD */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="w-full min-h-64 bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/60 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-md hover:shadow-lg transition-all"
          >

            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg">
              {isFlipped ? '💡 CEVAP' : '❓ SORU'}
            </span>

            <p className="text-base font-bold text-slate-800 max-w-lg leading-relaxed">
              {isFlipped
                ? currentCard.answer
                : currentCard.question}
            </p>

            <span className="text-[11px] text-slate-400 font-medium">
              {isFlipped
                ? 'Soruya dönmek için tıkla'
                : 'Cevabı görmek için tıkla'}
            </span>

          </div>

          {/* BUTONLAR */}
          <div className="grid grid-cols-2 gap-4 pt-2">

            <button
              onClick={() => handleResponse('retry')}
              className="py-3 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>❌</span>
              Anlamadım / Tekrar
            </button>

            <button
              onClick={() => handleResponse('learned')}
              className="py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✅</span>
              Öğrendim
            </button>

          </div>

        </div>
      )}

      {/* TAMAMLANDI */}
      {isCompleted && (
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-amber-200/60 text-center space-y-4 shadow-sm">

          <span className="text-4xl">🎉</span>

          <h2 className="text-lg font-bold text-slate-800">
            Tebrikler! Tüm Kartları Öğrendin
          </h2>

          <p className="text-xs text-slate-500">
            Bu konudaki tüm flashcard'ları başarıyla tamamladın.
          </p>

          <button
            onClick={resetCards}
            className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Yeni Konu Çalış
          </button>

        </div>
      )}

    </div>
  );
}