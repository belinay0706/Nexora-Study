'use client';

import React, { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  summary: string;
  content: string[];
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Etkili Çalışma Yöntemleri 🧠✨',
    category: 'Üretkenlik',
    readTime: '2 dk okuma',
    // Minimalist, şık çalışma masası & not defteri görseli
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    summary: 'Pasif okumak yerine zihni aktif çalıştırarak bilgiyi gerçekten kavrama ve kalıcı hale getirme yolları.',
    content: [
      'Etkili bir çalışma süreci, bilgiyi pasif bir şekilde okumak yerine zihni aktif olarak çalıştırmaktan geçer.',
      'Bir konuyu gerçekten kavramak istiyorsanız, onu hiç bilmeyen birine en basit haliyle anlatmaya çalışmak eksiklerinizi görmenizi sağlar.',
      'Sayfalarca notu defalarca okumak yerine, okuduğunuz bölümü kapatıp kendi cümlelerinizle hatırlamaya çalışmak bilgiyi hafızaya kazır.',
      'Zihninizi devasa konularla boğmak yerine, büyük hedefleri yönetilebilir küçük parçalara bölmek öğrenme sürecini hem daha kolay hem de çok daha kalıcı hale getirecektir. 🚀📚'
    ]
  },
  {
    id: '2',
    title: 'Odaklanma ve Dikkati Toplama 🎯📱',
    category: 'Odaklanma',
    readTime: '2 dk okuma',
    // Minimalist, sade ve odaklanmayı simgeleyen ortam görseli
    image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80',
    summary: 'Derin odaklanma sağlamak için dikkat dağıtıcı unsurları yönetme ve tek bir göreve kilitlenme stratejileri.',
    content: [
      'Günümüzün en büyük engeli olan dikkat dağıtıcı unsurları yönetmek, derin bir odaklanma sağlama yolundaki ilk adımdır.',
      'Çalışma alanınızda dikkatinizi dağıtabilecek her şeyi, özellikle de telefonunuzu görüş alanınızın dışına çıkarmak zihninizin çalışma moduna geçmesini kolaylaştırır.',
      'Belirli bir süre sadece tek bir işe kilitlenip ardından kısa molalar vermek, beynin yorulmadan yüksek verimle çalışmasını sağlar.',
      'Aynı anda birden fazla şeyle ilgilenmek yerine tek bir göreve odaklandığınızda, zihinsel enerjinizi koruyarak çok daha kısa sürede yüksek kaliteli sonuçlar elde edebilirsiniz. ⏳💡'
    ]
  },
  {
    id: '3',
    title: 'Günlük Planlama ve Zaman Yönetimi 🗓️ gün',
    category: 'Zaman Yönetimi',
    readTime: '2 dk okuma',
    // Minimalist ajanda, saat ve planlama görseli
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80',
    summary: 'Zamanı kısıtlamak yerine doğru önceliklendirme yaparak sürdürülebilir ve verimli bir günlük düzen yaratma rehberi.',
    content: [
      'Başarılı bir gün planı, zamanı saat saat kısıtlamaktan ziyade doğru önceliklendirme yapmaktan geçer.',
      'Günün ilk saatlerinde zihinsel gücünüz en yüksek seviyedeyken en zor ve karmaşık görevleri aradan çıkarmak günün geri kalanını çok daha rahat geçirmenizi sağlar.',
      'Öğleden sonralarını rutin işlere ve pratiklere ayırmak, akşamları ise günü değerlendirip bir sonraki günün en önemli görevlerini belirlemek sürdürülebilir bir düzen yaratır.',
      'Günlük programa beklenmedik durumlar için esnek boşluklar eklemek ise motivasyonunuzu düşürmeden planınıza sadık kalmanızı kolaylaştırır. 🌟🌿'
    ]
  }
];

export default function Explore() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Üst Başlık */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-amber-200/60 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span>✨</span> Keşfet & Verimlilik Rehberi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ders çalışma sürecini daha keyifli ve verimli hale getirecek mini ipuçları ve içerikler.
        </p>
      </div>

      {/* Makale Listesi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="group bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/50 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Mini Resim */}
              <div className="h-40 w-full overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/60 shadow-xs">
                  {item.category}
                </span>
              </div>

              {/* Metin Detayı */}
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-800 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between text-[11px] font-semibold text-amber-800">
              <span>{item.readTime}</span>
              <span className="group-hover:translate-x-1 transition-transform">Oku →</span>
            </div>
          </div>
        ))}
      </div>

      {/* OKUMA MODALI */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
              {selectedArticle.category}
            </span>

            <h2 className="text-xl font-bold text-slate-800 pt-1">
              {selectedArticle.title}
            </h2>

            <div className="h-56 w-full rounded-2xl overflow-hidden">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed pt-2">
              {selectedArticle.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}