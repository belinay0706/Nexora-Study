'use client';

import React, { useState, useEffect } from 'react';

const fullCurriculumData: {
  [key: string]: { name: string; icon: string; topics: string[] }[];
} = {
  '1. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📖',
      topics: [
        'İlkokuma yazma hazırlık',
        'Harflerin öğrenilmesi',
        'Güzel davranışlar',
        'Atatürk sevgisi',
        'Çevremizdeki yaşam',
        'Okuma ve anlama',
      ],
    },
    {
      name: 'Matematik',
      icon: '➕',
      topics: [
        'Uzamsal ilişkiler',
        'Konum ve örüntü',
        'Doğal sayılar',
        'Toplama işlemi',
        'Çıkarma işlemi',
        'Paralarımız ve zaman',
        'Geometrik cisimler',
      ],
    },
    {
      name: 'Hayat Bilgisi',
      icon: '🌱',
      topics: [
        'Ben ve okulum',
        'Sağlık ve güvenlik',
        'Ailem ve toplum',
        'Ülkemi seviyorum',
        'Doğa ve çevre',
      ],
    },
  ],

  '2. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📝',
      topics: [
        'Değerlerimiz',
        'Atatürk ve çocuk',
        'Doğa olayları',
        'Okuma serüveni',
        'Yetenekler',
        'Kelime bilgisi',
        'Yazım kuralları',
      ],
    },
    {
      name: 'Matematik',
      icon: '📐',
      topics: [
        'Sayılar ve nicelikler',
        'Cebirsel düşünme',
        'Geometrik şekiller',
        'Ölçme',
        'Veri toplama',
      ],
    },
    {
      name: 'Hayat Bilgisi',
      icon: '🏫',
      topics: [
        'Okul hayatı',
        'Ev hayatı',
        'Sağlıklı hayat',
        'Güvenli hayat',
        'Ülkemizde hayat',
        'Doğada hayat',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🇬🇧',
      topics: ['Words', 'Friends', 'Classroom', 'Numbers', 'Colors', 'Playground'],
    },
  ],

  '3. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📚',
      topics: [
        'Okuma anlama',
        'Yazma becerileri',
        'Eş ve zıt anlam',
        'Dil bilgisi kuralları',
        'Paragraf analizi',
      ],
    },
    {
      name: 'Matematik',
      icon: '🔢',
      topics: [
        '3 basamaklı sayılar',
        'Dört işlem derinleşme',
        'Basit kesirler',
        'Simetri',
        'Çevre ve alan',
        'Grafik okuma',
      ],
    },
    {
      name: 'Hayat Bilgisi',
      icon: '🌿',
      topics: [
        'Okulda yaşam',
        'Evde yaşam',
        'Sağlık ve güvenlik',
        'Ülke ve doğa',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '🔬',
      topics: [
        'Gezegenimiz',
        '5 duyumuz',
        'Kuvvet',
        'Madde',
        'Işık ve ses',
        'Canlılar dünyası',
        'Elektrikli araçlar',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🎨',
      topics: ['Greeting', 'Family', 'Feelings', 'Toys', 'House'],
    },
  ],

  '4. Sınıf': [
    {
      name: 'Türkçe',
      icon: '✍️',
      topics: [
        'Eleştirel okuma',
        'Ana fikir',
        '5N1K',
        'Gerçek/mecaz anlam',
        'Deyimler ve atasözleri',
        'Ek bilgisi',
      ],
    },
    {
      name: 'Matematik',
      icon: '📊',
      topics: [
        'Büyük sayılarla işlemler',
        'Kesirler',
        'Zaman ve grafikler',
        'Açılar',
        'Üçgen ve dörtgenler',
      ],
    },
    {
      name: 'Sosyal Bilgiler',
      icon: '🌍',
      topics: [
        'Kimliğimiz',
        'Geçmişimiz',
        'Yaşadığımız yer',
        'Bölgeler ve afetler',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '⚡',
      topics: [
        'Yer kabuğu',
        'Besinlerimiz',
        'Kuvvetin etkileri',
        'Maddenin özellikleri',
        'Aydınlatma ve ses',
        'Elektrik devreleri',
      ],
    },
    {
      name: 'Din Kültürü',
      icon: '🌙',
      topics: [
        'Temel dini kavramlar',
        'İslamın şartları',
        'Hz. Muhammedin ailesi',
        'Fatiha suresi',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🎒',
      topics: [
        'Classroom rules',
        'Nationality',
        'Free time',
        'My day',
        'Science',
      ],
    },
  ],

  '5. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📖',
      topics: [
        'Sözcükte ve cümlede anlam',
        'Paragraf yapısı',
        'Yazım ve noktalama',
        'Metin türleri',
      ],
    },
    {
      name: 'Matematik',
      icon: '📈',
      topics: [
        'Milyonlar',
        'Üslü ifadeler',
        'Parantezli işlemler',
        'Kesirler ve ondalık',
        'Yüzdeler',
        'Üçgenler',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '🔭',
      topics: [
        'Güneş, Dünya, Ay',
        'Canlı çeşitliliği',
        'Kuvvet ve sürtünme',
        'Hal değişimi',
        'Işığın yansıması',
        'Elektrik devreleri',
      ],
    },
    {
      name: 'Sosyal Bilgiler',
      icon: '🏛️',
      topics: [
        'Haklarımız',
        'Anadolu medeniyetleri',
        'Doğal ve tarihi varlıklar',
        'İklim ve çevre sorunları',
      ],
    },
    {
      name: 'Din Kültürü',
      icon: '✨',
      topics: [
        'Allah inancı',
        'Oruç ibadeti',
        'Adap ve nezaket',
        'Örnek ahlak',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🗺️',
      topics: [
        'Hello',
        'My town',
        'Hobbies',
        'Daily routine',
        'Health',
        'Movies',
      ],
    },
  ],

  '6. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📝',
      topics: [
        'İsimler, sıfatlar, zamirler',
        'Tamlamalar',
        'Edat, bağlaç, ünlem',
        'Söz sanatları',
      ],
    },
    {
      name: 'Matematik',
      icon: '📐',
      topics: [
        'Çarpanlar ve katlar',
        'Kümeler',
        'Tam sayılar',
        'Kesirlerle işlemler',
        'Ondalık gösterim',
        'Oran',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '🧪',
      topics: [
        'Tutulmalar',
        'Vücut sistemleri',
        'Bileşke kuvvet',
        'Yoğunluk',
        'Madde ve ısı',
        'Ses sürati',
      ],
    },
    {
      name: 'Sosyal Bilgiler',
      icon: '📜',
      topics: [
        'Kültürümüz',
        'Orta Asya Türk tarihi',
        'İlk Türk-İslam devletleri',
        'Türkiye coğrafyası',
      ],
    },
    {
      name: 'Din Kültürü',
      icon: '🤲',
      topics: [
        'Peygamber inancı',
        'Namaz ibadeti',
        'Zararlı alışkanlıklar',
        'Davet dönemi',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🍳',
      topics: ['Life', 'Breakfast', 'Downtown', 'Weather', 'Fair'],
    },
  ],

  '7. Sınıf': [
    {
      name: 'Türkçe',
      icon: '📚',
      topics: [
        'Fiiller ve yapısı',
        'Anlam kayması',
        'Anlatım bozuklukları',
        'Yazı türleri',
      ],
    },
    {
      name: 'Matematik',
      icon: '🔢',
      topics: [
        'Tam sayılarla işlemler',
        'Rasyonel sayılar',
        'Denklemler',
        'Oran-orantı',
        'Yüzdeler',
        'Çember ve daire',
        'Veri analizi',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '🔬',
      topics: [
        'Uzay araştırmaları',
        'Hücre ve bölünmeler',
        'İş ve enerji',
        'Saf maddeler ve karışımlar',
        'Aynalar',
        'Üreme ve gelişme',
      ],
    },
    {
      name: 'Sosyal Bilgiler',
      icon: '⚖️',
      topics: [
        'İletişim',
        'Osmanlı tarihi',
        'Kültür ve sanat',
        'Avrupa ve Osmanlı',
        'Nüfus ve göç',
      ],
    },
    {
      name: 'Din Kültürü',
      icon: '🕋',
      topics: [
        'Melek ve ahiret',
        'Hac ve kurban',
        'Ahlaki davranışlar',
        'Hz. Muhammedin yönü',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🌟',
      topics: [
        'Appearances',
        'Biographies',
        'Sports',
        'Wild animals',
        'Televisions',
      ],
    },
  ],

  '8. Sınıf': [
    {
      name: 'Türkçe',
      icon: '✍️',
      topics: [
        'Fiilimsiler',
        'Cümlenin ögeleri',
        'Fiilde çatı',
        'Cümle türleri',
        'Mantık muhakeme',
        'Görsel okuma',
      ],
    },
    {
      name: 'Matematik',
      icon: '📊',
      topics: [
        'Çarpanlar ve katlar',
        'Üslü ve köklü ifadeler',
        'Olasılık',
        'Özdeşlikler',
        'Doğrusal denklemler',
        'Eşitsizlikler',
        'Üçgenler',
      ],
    },
    {
      name: 'Fen Bilimleri',
      icon: '⚛️',
      topics: [
        'Mevsimler ve iklim',
        'DNA ve genetik kod',
        'Basınç',
        'Periyodik sistem',
        'Asitler ve bazlar',
        'Enerji akışı',
        'Elektrik yükleri',
      ],
    },
    {
      name: 'İnkılap Tarihi',
      icon: '🎖️',
      topics: [
        'Bir kahraman doğuyor',
        'Milli uyanış',
        'Atatürkçülük',
        'Demokrasi adımları',
        'Türk dış politikası',
      ],
    },
    {
      name: 'Din Kültürü',
      icon: '📖',
      topics: [
        'Kader ve kaza',
        'Zekat ve sadaka',
        'Din ve hayat',
        'Hz. Muhammedin adaleti',
        'Kuran özellikleri',
      ],
    },
    {
      name: 'İngilizce',
      icon: '🚀',
      topics: [
        'Friendship',
        'Teen life',
        'Kitchen',
        'Phone',
        'Internet',
        'Adventures',
        'Tourism',
      ],
    },
  ],

  '9. Sınıf': [
    {
      name: 'Türk Dili ve Edebiyatı',
      icon: '📜',
      topics: [
        'Edebiyata giriş',
        'Hikaye, şiir, roman',
        'Biyografi ve mektup',
        'Dil bilgisi temelleri',
      ],
    },
    {
      name: 'Matematik',
      icon: '📐',
      topics: [
        'Mantık',
        'Kümeler',
        'Sayılar',
        'Denklem ve eşitsizlikler',
        'Üslü-köklü ifadeler',
        'Oran-orantı',
        'Üçgenler',
        'Trigonometri',
      ],
    },
    {
      name: 'Fizik',
      icon: '⚡',
      topics: [
        'Fizik bilimi',
        'Madde ve özellikleri',
        'Hareket ve kuvvet',
        'İş, güç, enerji',
        'Isı ve sıcaklık',
        'Elektrostatik',
      ],
    },
    {
      name: 'Kimya',
      icon: '🧪',
      topics: [
        'Kimya bilimi',
        'Atom ve periyodik sistem',
        'Kimyasal türler',
        'Bağlar',
        'Maddenin halleri',
      ],
    },
    {
      name: 'Biyoloji',
      icon: '🧬',
      topics: [
        'Yaşam bilimi',
        'Hücre yapısı',
        'Canlılar dünyası',
      ],
    },
    {
      name: 'Tarih',
      icon: '🏛️',
      topics: [
        'Tarih ve zaman',
        'İlk dönemler',
        'Orta çağ dünyası',
        'Türk dünyası',
        'İslam medeniyeti',
      ],
    },
    {
      name: 'Coğrafya',
      icon: '🌍',
      topics: [
        'Doğa ve insan',
        'Dünyanın hareketleri',
        'Harita bilgisi',
        'İklim coğrafyası',
        'Yerleşmeler',
      ],
    },
  ],

  '10. Sınıf': [
    {
      name: 'Türk Dili ve Edebiyatı',
      icon: '📖',
      topics: [
        'Destan ve halk şiiri',
        'Divan şiiri',
        'Tanzimat romanı',
        'Tiyatro ve anı',
      ],
    },
    {
      name: 'Matematik',
      icon: '📈',
      topics: [
        'Sayma ve olasılık',
        'Fonksiyonlar',
        'Polinomlar',
        '2. dereceden denklemler',
        'Çokgenler',
        'Uzay geometri',
      ],
    },
    {
      name: 'Fizik',
      icon: '💡',
      topics: [
        'Elektrik ve manyetizma',
        'Basınç',
        'Kaldırma kuvveti',
        'Dalgalar',
        'Optik',
      ],
    },
    {
      name: 'Kimya',
      icon: '⚗️',
      topics: [
        'Kimyasal hesaplamalar',
        'Karışımlar',
        'Asit, baz, tuz',
        'Kimya her yerde',
      ],
    },
    {
      name: 'Biyoloji',
      icon: '🦠',
      topics: [
        'Hücre bölünmeleri',
        'Üreme çeşitleri',
        'Kalıtım ilkeleri',
        'Ekosistem',
      ],
    },
    {
      name: 'Tarih',
      icon: '👑',
      topics: [
        'Selçuklu Türkiyesi',
        'Osmanlı siyaseti',
        'Osmanlı medeniyeti',
        'Dünya gücü Osmanlı',
      ],
    },
    {
      name: 'Coğrafya',
      icon: '🗺️',
      topics: [
        'İç ve dış kuvvetler',
        'Türkiye yer şekilleri',
        'Su ve toprak',
        'Nüfus ve göçler',
        'Ekonomik faaliyetler',
      ],
    },
  ],

  '11. Sınıf': [
    {
      name: 'Türk Dili ve Edebiyatı',
      icon: '📝',
      topics: [
        'Edebiyat ve toplum',
        'Hikaye ve şiir analizleri',
        'Eleştiri ve röportaj',
        'Cümle türleri',
      ],
    },
    {
      name: 'Matematik',
      icon: '📉',
      topics: [
        'Trigonometri',
        'Analitik geometri',
        'Fonksiyon uygulamaları',
        'Eşitsizlikler',
        'Çember ve daire',
      ],
    },
    {
      name: 'Fizik',
      icon: '⚙️',
      topics: [
        'Vektörler ve hareket',
        'Newton yasaları',
        'Momentum ve tork',
        'Elektriksel kuvvet',
        'Manyetizma',
      ],
    },
    {
      name: 'Kimya',
      icon: '🔬',
      topics: [
        'Modern atom teorisi',
        'Gazlar',
        'Çözeltiler',
        'Tepkimelerde enerji',
        'Hız ve denge',
      ],
    },
    {
      name: 'Biyoloji',
      icon: '🩺',
      topics: [
        'İnsan fizyolojisi (sistemler)',
        'Embriyonik gelişim',
        'Ekoloji',
      ],
    },
    {
      name: 'Tarih',
      icon: '⏳',
      topics: [
        'Osmanlı siyasi dengeleri',
        'Avrupa ve değişim',
        'Devrimler çağdaşlaşma',
        'Dağılma dönemi',
      ],
    },
  ],

  '12. Sınıf': [
    {
      name: 'Türk Dili ve Edebiyatı',
      icon: '📜',
      topics: [
        'Cumhuriyet dönemi şiir',
        'Cumhuriyet romanı',
        'Deneme ve söylev',
        'Genel tekrar',
      ],
    },
    {
      name: 'Matematik',
      icon: '📐',
      topics: [
        'Logaritma',
        'Diziler',
        'Trigonometri ileri',
        'Limit ve süreklilik',
        'Türev',
        'İntegral',
      ],
    },
    {
      name: 'Fizik',
      icon: '🛸',
      topics: [
        'Çembersel hareket',
        'Kütle çekim',
        'Basit harmonik hareket',
        'Dalga mekaniği',
      ],
    },
    {
      name: 'Kimya',
      icon: '🔋',
      topics: [
        'Kimya ve elektrik',
        'Karbon kimyası',
        'Organik bileşikler',
        'Enerji kaynakları',
      ],
    },
    {
      name: 'Biyoloji',
      icon: '🧬',
      topics: [
        'Protein sentezi',
        'Biyoteknoloji',
        'Hücre solunumu',
        'Fotosentez',
        'Bitki biyolojisi',
      ],
    },
    {
      name: 'İnkılap Tarihi',
      icon: '🇹🇷',
      topics: [
        '20. yüzyıl başları',
        'Milli Mücadele',
        'Atatürk ilkeleri',
        'İkinci Dünya Savaşı',
        'Soğuk Savaş',
      ],
    },
  ],

  KPSS: [
    {
      name: 'Türkçe',
      icon: '✍️',
      topics: [
        'Paragraf ve anlam',
        'Dil bilgisi',
        'Yazım ve noktalama',
        'Sözel mantık',
      ],
    },
    {
      name: 'Matematik & Geometri',
      icon: '🔢',
      topics: [
        'Temel kavramlar',
        'Problemler',
        'Denklemler',
        'Sayısal mantık',
        'Geometri temelleri',
      ],
    },
    {
      name: 'Tarih',
      icon: '📜',
      topics: [
        'İslamiyet öncesi',
        'Osmanlı Devleti',
        'Kurtuluş Savaşı',
        'Atatürk inkılapları',
        'Çağdaş Türk ve Dünya',
      ],
    },
    {
      name: 'Coğrafya',
      icon: '🗺️',
      topics: [
        'Türkiye fiziki yapısı',
        'Beşeri coğrafya',
        'Ekonomik coğrafya',
      ],
    },
    {
      name: 'Vatandaşlık',
      icon: '⚖️',
      topics: [
        'Hukuk kavramları',
        'Anayasa tarihi',
        '1982 Anayasası ilkeleri',
        'İdare hukuku',
      ],
    },
    {
      name: 'Güncel Bilgiler',
      icon: '⭐',
      topics: [
        'Güncel gelişmeler',
        'Uluslararası kuruluşlar',
      ],
    },
  ],
};

interface SubjectsProps {
  selectedLevel?: string;
}

export default function Subjects({ selectedLevel }: SubjectsProps) {
  const [currentLevel, setCurrentLevel] = useState<string>(
    selectedLevel || '12. Sınıf'
  );

  useEffect(() => {
    if (selectedLevel && selectedLevel.trim()) {
      setCurrentLevel(selectedLevel);
      return;
    }

    const savedLevel = localStorage.getItem('selectedLevel');

    if (savedLevel && savedLevel.trim()) {
      setCurrentLevel(savedLevel);
    }
  }, [selectedLevel]);

  /*
   * Kullanıcıdan gelen seviyeyi müfredat anahtarına çevirir.
   *
   * Örnekler:
   * "11. Sınıf"       -> "11. Sınıf"
   * "11. Sınıf (Lise)" -> "11. Sınıf"
   * "12. Sınıf (YKS)" -> "12. Sınıf"
   * "8. Sınıf (LGS)"  -> "8. Sınıf"
   * "KPSS"             -> "KPSS"
   */
  const normalizeLevel = (level: string): string => {
    const value = level.trim();

    const cleaned = value
      .replace(/\s*\(Lise\)\s*/gi, '')
      .replace(/\s*\(YKS\)\s*/gi, '')
      .replace(/\s*\(LGS\)\s*/gi, '')
      .trim();

    if (cleaned.toLowerCase() === 'kpss') {
      return 'KPSS';
    }

    if (fullCurriculumData[cleaned]) {
      return cleaned;
    }

    const classMatch = cleaned.match(/^(\d+)\.\s*Sınıf$/i);

    if (classMatch) {
      const classKey = `${classMatch[1]}. Sınıf`;

      if (fullCurriculumData[classKey]) {
        return classKey;
      }
    }

    return '12. Sınıf';
  };

  const normalizedKey = normalizeLevel(currentLevel);

  const subjectsToDisplay =
    fullCurriculumData[normalizedKey] ||
    fullCurriculumData['12. Sınıf'];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📚</span>
            Resmi MEB & Sınav Konu Havuzu
          </h1>

          <p className="text-xs text-slate-400 mt-1 font-medium">
            Seçtiğin{' '}
            <span className="font-bold text-teal-300">
              {currentLevel}
            </span>{' '}
            seviyesine ait güncel müfredat başlıkları.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 bg-teal-950 text-teal-300 rounded-xl border border-teal-800 uppercase tracking-wider">
          {normalizedKey}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectsToDisplay.map((sub, idx) => (
          <div
            key={`${normalizedKey}-${sub.name}-${idx}`}
            className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2.5 bg-slate-800 rounded-2xl">
                {sub.icon}
              </span>

              <div>
                <h3 className="font-bold text-white text-base">
                  {sub.name}
                </h3>

                <span className="text-xs text-slate-400">
                  Güncel Ünite ve Konular
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 max-h-64 overflow-y-auto pr-1">
              {sub.topics.map((topic, tIdx) => (
                <div
                  key={`${normalizedKey}-${sub.name}-${tIdx}`}
                  className="flex items-center justify-between text-xs font-semibold text-slate-300 bg-slate-900/80 p-3 rounded-2xl border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>{topic}</span>
                  </div>

                  <span className="text-[10px] text-teal-300 bg-teal-950 px-2 py-0.5 rounded-md font-bold border border-teal-800">
                    Çalışılacak
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}