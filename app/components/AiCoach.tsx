'use client';

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Session {
  lesson: string;
  topic?: string;
  duration: number; // dakika
  type: 'Çalışma' | 'Mola';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 📚 Kapsamlı Eğitim Veri Tabanı (Tüm Sınıflar, Bölümler, Dersler ve Konular)
const CURRICULUM_DATA: Record<string, {
  grades: string[];
  departments?: string[];
  lessons: Record<string, Record<string, string[]>>; // Sınıf -> Ders -> Konular
}> = {
  "1. Sınıf": {
    grades: ["1. Sınıf"],
    lessons: {
      "1. Sınıf": {
        "Türkçe": ["İlkokuma yazma öğretimi hazırlık dönemi", "Harflerin öğrenilmesi", "Güzel davranışlarımız", "Mustafa Kemal'den Atatürk'e", "Çevremizdeki yaşam", "Okuma ve anlama"],
        "Matematik": ["Uzamsal ilişkiler", "Konum ve örüntü", "Doğal sayılar", "Doğal sayılarla toplama işlemi", "Doğal sayılarla çıkarma işlemi", "Paralarımız ve zaman ölçme", "Geometrik cisimler, şekiller ve tartma"],
        "Hayat Bilgisi": ["Ben ve okulum", "Sağlığım ve güvenliğim", "Ailem ve toplum", "Ülkemi seviyorum", "Doğa ve çevre"]
      }
    }
  },
  "2. Sınıf": {
    grades: ["2. Sınıf"],
    lessons: {
      "2. Sınıf": {
        "Türkçe": ["Değerlerimizle varız", "Atatürk ve çocuk", "Doğada neler oluyor", "Okuma serüvenimiz", "Yeteneklerimizi tanıyoruz", "Mucit çocuk temaları", "Okuma yazma geliştirme", "Kelime bilgisi", "Yazım ve noktalama kuralları"],
        "Matematik": ["Sayılar ve nicelikler", "İşlemlerden cebirsel düşünmeye", "Nesnelerin geometrisi", "Ölçme", "Veri toplama"],
        "Hayat Bilgisi": ["Okulumuzda hayat", "Evimizde hayat", "Sağlıklı hayat", "Güvenli hayat", "Ülkemizde hayat", "Doğada hayat"],
        "İngilizce": ["Words", "Friends", "In the classroom", "Numbers", "Colors", "At the playground"]
      }
    }
  },
  "3. Sınıf": {
    grades: ["3. Sınıf"],
    lessons: {
      "3. Sınıf": {
        "Türkçe": ["Okuma anlama", "Yazma becerilerinde derinleşme", "Eş ve zıt anlamlı kelimeler", "Basit dil bilgisi kuralları", "Parça ve paragraf anlamı"],
        "Matematik": ["3 basamaklı doğal sayılar", "Eldeli toplama ve kalanlı kalansız bölme işlemleri", "Basit kesirler", "Geometrik şekillerde simetri", "Çevre ve alan ölçmeye giriş", "Grafik okuma"],
        "Hayat Bilgisi": ["Okulumuzda hayat", "Evimizde hayat", "Sağlıklı hayat", "Güvenli hayat", "Ülkemizde hayat", "Doğada hayat"],
        "Fen Bilimleri": ["Gezegenimizi tanıyalım", "5 duyumuz", "Kuvveti tanıyalım", "Maddeyi tanıyalım", "Çevremizdeki ışık ve sesler", "Canlılar dünyasına yolculuk", "Elektrikli araçlar"],
        "İngilizce": ["Greeting", "My family", "People I love", "Feelings", "Toys and games", "My house"]
      }
    }
  },
  "4. Sınıf": {
    grades: ["4. Sınıf"],
    lessons: {
      "4. Sınıf": {
        "Türkçe": ["Okuduğunu eleştirel değerlendirme", "Ana fikir, ana duygu bulma", "5N1K çalışmaları", "Gerçek ve mecaz anlam", "Deyimler ve atasözleri", "Yapım ve çekim ekleri"],
        "Matematik": ["4 5 6 basamaklı doğal sayılar", "Büyük sayılarla 4 işlem", "Kesirlerle işlemler", "Zaman ve sütun grafiği ölçümleri", "Geometride açılar ve üçgen", "Dörtgen özellikleri"],
        "Sosyal Bilgiler": ["Herkesin bir kimliği var", "Geçmişimi öğreniyorum", "Yaşadığımız yer", "Bölgelerimiz ve doğal afetler"],
        "Fen Bilimleri": ["Yer kabuğu ve dünyamızın hareketleri", "Besinlerimiz", "Kuvvetin etkileri", "Maddenin özellikleri", "Aydınlatma ve ses teknolojileri", "İnsan ve çevre", "Basit elektrik devreleri"],
        "Din Kültürü ve Ahlak Bilgisi": ["Din ve ahlak hakkında temizlik", "Tekbir ve salavat", "Temel dini kavramlar", "İslam'ın ve imanın şartları", "Hazreti Muhammed'in aile ve hayatı", "Fatiha suresi"],
        "İngilizce": ["Classroom rules", "Nationality", "Cartoon characters", "Free time", "My day", "Fun with science"]
      }
    }
  },
  "5. Sınıf": {
    grades: ["5. Sınıf"],
    lessons: {
      "5. Sınıf": {
        "Türkçe": ["Sözcükte ve cümlede anlam", "Paragrafta yapı", "Ana fikir", "Yazım kuralları", "Noktalama işaretleri", "Metin türleri"],
        "Matematik": ["Milyonlu sayılar", "Dört işlem problemleri", "Üslü ifadeler", "Parantezli işlemler", "Kesirler", "Ondalık gösterim", "Yüzdeler", "Temel geometrik kavramlar ve üçgenler"],
        "Fen Bilimleri": ["Güneş, Dünya ve Ay'ın yapısı, hareketleri", "Canlıların çeşitliliği", "Kuvvetin ölçülmesi ve sürtünme", "Maddenin hal değişimi ve ayırt edici özellikleri", "Işığın yayılması ve yansıması", "İnsan ve çevre", "Basit elektrik devre elemanları"],
        "Sosyal Bilgiler": ["Haklarımı öğreniyorum", "Anadolu ve Mezopotamya medeniyetleri", "Çevremizdeki doğal varlıklar ve tarihi mekanlar", "Harita bilgisi ve iklimin insan faaliyetlerindeki etkisi", "Afetler ve çevre sorunları"],
        "Din Kültürü": ["Allah inancı", "Ramazan ayı ve oruç ibadeti", "Adap ve nezaket kuralları", "Hz. Muhammed'in aile hayatı ve örnek ahlakı"],
        "İngilizce": ["Hello", "My town", "Games and hobbies", "My daily routine", "Health", "Movies"]
      }
    }
  },
  "6. Sınıf": {
    grades: ["6. Sınıf"],
    lessons: {
      "6. Sınıf": {
        "Türkçe": ["İsimler", "Sıfatlar", "Zamirler", "Tamlamalar", "Edat, bağlaç, ünlem", "Söz sanatları", "Metin yapı analizi"],
        "Matematik": ["Doğal sayıların çarpanları ve katları", "Bölünebilme kuralları", "Asal sayılar", "Kümeler", "Tam sayılar ve mutlak değerler", "Kesirlerle dört işlem", "Ondalık ifadelerde bölme ve çarpma", "Oran"],
        "Fen Bilimleri": ["Güneş ve Ay tutulmaları", "Destek hareket sistemi", "Sindirim, dolaşım, solunum ve boşaltım sistemleri", "Bileşke kuvvet ve sabit süratli hareket", "Maddenin tanecikli yapısı", "Yoğunluk", "Madde ve ısı", "Sesin yayılması ve sürati"],
        "Sosyal Bilgiler": ["Kültürümüzle varız", "Türklerin İslamiyet öncesi Orta Asya tarihi", "İlk Türk İslam devletleri", "Yeryüzünde yaşam", "Türkiye'nin coğrafi özellikleri ve kaynakları"],
        "Din Kültürü": ["Peygamber ve ilahi kitap inancı", "Namaz ibadeti ve önemi", "Zararlı alışkanlıklar ve korunma yolları", "Hazreti Muhammed'in davet dönemi"],
        "İngilizce": ["Life", "Yummy breakfast", "Downtown", "Weather and emotions", "At the fair"]
      }
    }
  },
  "7. Sınıf": {
    grades: ["7. Sınıf"],
    lessons: {
      "7. Sınıf": {
        "Türkçe": ["Fiiller", "Fiilde yapı", "Anlam kayması", "Sözcükte, cümlede, paragrafta anlam", "Anlatım bozuklukları", "Yazı türleri"],
        "Matematik": ["Tam sayılarda işlemler", "Rasyonel sayılar ve işlemler", "Eşitlik ve denklem", "Oran orantı", "Yüzde problemleri", "Doğrular ve açılar", "Çember ve daire", "Veri analizi"],
        "Fen Bilimleri": ["Uzay araştırmaları, teleskoplar", "Hücre yapısı", "Mitoz ve mayoz bölünme", "Kütle ve ağırlık ilişkisi", "İş ve enerji dönüşümleri", "Saf maddeler ve karışımlar", "Karışımların ayrıştırılması", "Işığın soğurulması, aynalar", "Canlılarda üreme, büyüme ve gelişme"],
        "Sosyal Bilgiler": ["İletişimsel beceriler ve halkla ilişkiler", "Osmanlı Devleti'nin kuruluşu, yükselişi ve fethi siyaseti", "Osmanlı'da kültür ve sanat", "Avrupa'daki gelişmelerin Osmanlı'ya etkisi", "Nüfus ve göç"],
        "Din Kültürü": ["Melek ve ahiret inancı", "Hac ve kurban ibadetleri", "Ahlaki davranışlar", "Hazreti Muhammed'in insani ve peygamberi yönü"],
        "İngilizce": ["Appearances and personality", "Biographies", "Sports", "Wild animals", "Televisions"]
      }
    }
  },
  "8. Sınıf (LGS)": {
    grades: ["8. Sınıf"],
    lessons: {
      "8. Sınıf": {
        "Türkçe": ["Fiilimsiler", "Cümlenin ögeleri", "Fiilde çatı", "Cümle türleri", "Anlatım bozuklukları", "Mantık muhakeme soruları", "Görsel ve grafik okuma"],
        "Matematik": ["Çarpanlar ve katlar", "Üslü ifadeler", "Kareköklü ifadeler", "Veri analizi", "Basit olayların olma olasılığı", "Cebirsel ifadeler ve özdeşlikler", "Doğrusal denklemler", "Eşitsizlikler", "Üçgenler", "Dönüşüm geometrisi ve geometrik cisimler"],
        "Fen Bilimleri": ["Mevsimlerin oluşumu, iklim ve hava hareketleri", "DNA ve genetik kod, kalıtım", "Mutasyon, modifikasyon, adaptasyon", "Biyoteknoloji", "Katı sıvı gaz basıncı", "Periyodik sistem", "Fiziksel ve kimyasal değişimler", "Asitler ve bazlar", "Madde döngüleri, sürdürülebilir kalkınma", "Elektriksel yükler ve elektrik enerjisi"],
        "İnkılap Tarihi ve Atatürkçülük": ["Bir kahraman doğuyor", "Milli uyanış, milli bir destan", "Atatürkçülük ve çağdaşlaşan Türkiye", "Demokratikleşme çabaları", "Atatürk dönemi Türk dış politikası"],
        "Din Kültürü": ["Kader ve kaza inancı", "Zekat ve sadaka ibadeti", "Din ve hayat", "Hazreti Muhammed'in cesareti, adaleti ve merhameti", "Kur'an-ı Kerim ve özellikleri"],
        "İngilizce": ["Friendship", "Teen life", "In the kitchen", "On the phone", "The internet", "Adventures", "Tourism"]
      }
    }
  },
  "Lise (9. Sınıf)": {
    grades: ["9. Sınıf"],
    lessons: {
      "9. Sınıf": {
        "Türk Dili ve Edebiyatı": ["Edebiyatın tanımı", "Hikaye, şiir, roman, tiyatro", "Biyografi, otobiyografi", "Mektup", "İsimler, sıfatlar, zamirler, zarflar"],
        "Matematik": ["Mantık", "Kümeler ve kartezyen çarpımı", "Sayılar", "1. dereceden denklem ve eşitsizlikler", "Üslü köklü ifadeler", "Oran orantı", "Yaş, işçi, kar zarar problemleri", "Üçgenler, benzerlik", "Trigonometriye giriş", "Veri ve merkezi eğilim ölçüleri"],
        "Fizik": ["Fizik bilimine giriş", "Madde ve özellikleri", "Hareket ve kuvvet", "İş güç enerji", "Isı ve sıcaklık", "Elektrostatik"],
        "Kimya": ["Kimya bilimi", "Atom ve periyodik sistem", "Kimyasal türler arası etkileşimler", "Güçlü ve zayıf etkileşimler", "Maddenin fiziksel halleri ve çevre kimyası"],
        "Biyoloji": ["Yaşam bilimi", "Biyoloji", "Hücre", "Canlılar dünyası"],
        "Tarih": ["Tarih ve zaman", "İnsanlığın ilk dönemleri", "Orta çağda dünya", "İlk ve orta çağda Türk dünyası", "İslam medeniyetlerinin doğuşu", "Türklerin İslamiyeti kabulü"],
        "Coğrafya": ["Doğa ve insan", "Dünyanın şekli ve hareketleri", "Harita bilgisi", "Atmosfer ve iklim coğrafyası", "Yerleşmelerin gelişimi", "Türkiye'nin coğrafi konumu"]
      }
    }
  },
  "Lise (10. Sınıf)": {
    grades: ["10. Sınıf"],
    lessons: {
      "10. Sınıf": {
        "Türk Dili ve Edebiyatı": ["Türk edebiyatının dönemleri", "Destan, efsane, halk şiiri, divan şiiri", "Tanzimat dönem romanı", "Geleneksel Türk tiyatrosu", "Anı, haber metinleri", "Cümlenin ögeleri, yazım ve noktalama"],
        "Matematik": ["Sayma ve olasılık", "Fonksiyonlar", "Polinomlar ve çarpanlara ayırma", "2. dereceden denklemler", "Çokgenler ve dörtgenler", "Uzay geometri"],
        "Fizik": ["Elektrik ve manyetizma", "Basınç ve kaldırma kuvveti", "Dalgalar", "Optik"],
        "Kimya": ["Kimyanın temel kanunları ve kimyasal hesaplamalar", "Karışımlar", "Asitler, bazlar ve tuzlar", "Kimya her yerde"],
        "Biyoloji": ["Hücre bölünmeleri", "Üreme çeşitleri", "Kalıtımın genel ilkeleri", "Ekosistem ekolojisi ve güncel çevre sorunları"],
        "Tarih": ["Yerleşme ve devletleşme sürecinde Selçuklu Türkiye'si", "Beylikten devlete Osmanlı siyaseti", "Devletleşme sürecinde askerler", "Osmanlı medeniyeti", "Dünya gücü Osmanlı"],
        "Coğrafya": ["Dünyanın iç yapısı ve levha tektoniği", "İç ve dış kuvvetler", "Türkiye'nin yer şekilleri", "Su, toprak, bitki varlığı", "Nüfusun özellikleri ve piramitleri, göçler"]
      }
    }
  },
  "Lise (11. Sınıf)": {
    grades: ["11. Sınıf"],
    lessons: {
      "11. Sınıf": {
        "Türk Dili ve Edebiyatı": ["Edebiyat ve toplum ilişkisi", "Hikaye, şiir, roman, tiyatro", "Eleştiri, mülakat, röportaj", "Cümle türleri ve anlatım bozuklukları"],
        "Matematik": ["Trigonometri", "Analitik geometri", "Fonksiyonlarda uygulamalar", "2. dereceden eşitsizlikler", "Çember ve dairenin geometrik özellikleri", "Uzay geometrisi", "Olasılık"],
        "Fizik": ["Vektörler, bağıl hareket", "Newton'un hareket yasaları", "İtme ve çizgisel momentum", "Tork ve denge", "Basit makineler", "Elektriksel kuvvet, alan ve potansiyel", "Manyetizma ve alternatif akım"],
        "Kimya": ["Modern atom teorisi", "Gazlar", "Sıvı çözeltiler ve çözünürlük", "Kimyasal tepkimelerde enerji, hız ve denge"],
        "Biyoloji": ["İnsan fizyolojisi (Sinir, endokrin, duyu, destek, sindirim, dolaşım, solunum, üriner ve üreme sistemi)", "Komünite ve popülasyon ekolojisi"],
        "Tarih": ["Değişen dünya dengeleri karşısında Osmanlı siyaseti", "Avrupa'da değişim çağı", "Devrimler çağında devlet ve toplum ilişkileri", "Osmanlı'nın dağılma dönemi"],
      }
    }
  },
  "Lise (12. Sınıf / YKS)": {
    grades: ["12. Sınıf"],
    lessons: {
      "12. Sınıf": {
        "Türk Dili ve Edebiyatı": ["Cumhuriyet Dönemi Saf Şiir", "Toplumcu Gerçekçi Şiir", "Garip Akımı, İkinci Yeni", "Cumhuriyet Dönemi Romanı", "Deneme, söylev", "Dil bilgisi genel tekrar"],
        "Matematik": ["Üstel ve logaritmik fonksiyonlar", "Gerçek sayı dizileri", "Trigonometri", "Limit ve süreklilik", "Türev kuralları", "İntegral"],
        "Fizik": ["Çembersel hareket, açısal momentum", "Kütle çekim kuvveti ve Kepler kanunları", "Basit harmonik hareket", "Dalga mekaniği"],
        "Kimya": ["Kimya ve elektrik", "Karbon kimyasına giriş", "Organik bileşikler", "Enerji kaynakları"],
        "Biyoloji": ["Nükleik asitler, genetik şifre, protein sentezi", "Biyoteknoloji ve gen mühendisliği", "Hücresel solunum ve fermantasyon", "Fotosentez ve kemosentez", "Bitki biyolojisi"],
        "T.C. İnkılap Tarihi ve Atatürkçülük": ["20. yüzyıl başlarında Osmanlı Devleti ve Dünya", "Milli Mücadele Dönemi", "Atatürkçülük ve Atatürk İlkeleri", "İki savaş arasındaki dönem", "İkinci Dünya Savaşı ve Soğuk Savaş dönemi"]
      }
    }
  },
  "KPSS Hazırlık": {
    grades: ["KPSS"],
    lessons: {
      "KPSS": {
        "Türkçe": ["Sözcükte, cümlede ve paragrafta anlam", "Dil bilgisi", "Yazım kuralları", "Noktalama işaretleri", "Anlatım bozuklukları", "Sözel mantık"],
        "Matematik ve Geometri": ["Temel kavramlar", "Rasyonel ve ondalık sayılar", "Üslü ve köklü ifadeler", "Çarpanlara ayırma", "Denklemler, oran orantı", "Problemler", "Kümeler, fonksiyonlar, olasılık", "Sayısal mantık ve geometri"],
        "Tarih": ["İslamiyet öncesi Türk tarihi", "İlk Türk İslam devletleri", "Osmanlı Devleti", "Kurtuluş savaşı hazırlık ve cepheler dönemi", "Atatürk ilke ve inkılapları", "Çağdaş Türk ve dünya tarihi"],
        "Coğrafya": ["Türkiye'nin fiziki özellikleri", "Türkiye'nin beşeri özellikleri", "Türkiye'nin ekonomik coğrafyası"],
        "Vatandaşlık": ["Hukukun temel kavramları", "Devlet biçimleri ve hükümet sistemleri", "Anayasa hukuku tarihi", "1982 Anayasası'nın temel ilkeleri", "İdare hukuku"],
        "Güncel Bilgiler": ["Türkiye'deki son kültürel, bilimsel, sportif gelişmeler", "Güncel siyasi gelişmeler", "Uluslararası kuruluşlar"]
      }
    }
  },
  "Bilgisayar Mühendisliği": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Analiz"], "Genel Fizik": ["Fizik Temelleri"], "Algoritma ve Programlamaya Giriş": ["Temel Algoritmalar"], "Lineer Cebir": ["Matrisler ve Vektörler"] },
      "2. Sınıf": { "Veri Yapıları": ["Ağaçlar, Graflar"], "Nesne Yönelimli Programlama": ["OOP Prensipleri"], "Mantıksal Tasarım": ["Devre Mantığı"], "Ayrık Matematik": ["Kümeler ve Mantık"] },
      "3. Sınıf": { "İşletim Sistemleri": ["Process ve Thread yönetimi"], "Veri Tabanı Yönetim Sistemleri": ["SQL ve İlişkisel Veritabanları"], "Bilgisayar Ağları": ["TCP/IP Modeli"], "Yazılım Mühendisliği": ["Yaşam Döngüsü"], "Algoritma Analizi": ["Big-O Notasyonu"] },
      "4. Sınıf": { "Yapay Zeka": ["Machine Learning temelleri"], "Siber Güvenlik": ["Ağ güvenliği"], "Bulut Bilişim": ["Cloud servisleri"], "Bilgisayar Mimarisi": ["İşlemci tasarımı"], "Mezuniyet Tasarım Projesi": ["Bitirme Projesi"] }
    }
  },
  "Elektrik Elektronik Müh.": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Kalkülüs"], "Fizik 1": ["Mekanik"], "Fizik 2": ["Elektromanyetizma"], "Kimya": ["Temel Kimya"], "Bilgisayar Programlama": ["C Programlama"] },
      "2. Sınıf": { "Devre Teorisi ve Analizi": ["AC/DC devreler"], "Diferansiyel Denklemler": ["Adi diferansiyel denklemler"], "Elektromanyetik Alan Teorisi": ["Maxwell denklemleri"], "Elektronik Devreler": ["Diyotlar ve Transistörler"] },
      "3. Sınıf": { "Sinyaller ve Sistemler": ["Fourier analizi"], "Analog ve Sayısal Elektronik": ["Op-amp ve lojik devreler"], "Kontrol Sistemleri": ["Geri besleme"], "Elektrik Makineleri": ["Trafo ve motorlar"], "Haberleşme Mühendisliği": ["Modülasyon"] },
      "4. Sınıf": { "Güç Sistemleri Analizi": ["İletim hatları"], "Gömülü Sistemler": ["Mikrokontrolcüler"], "Antenler ve Mikrodalga": ["Işıma teorisi"], "Dijital Sinyal İşleme": ["DSP filtreler"], "Bitirme Tezi": ["Araştırma ve Tasarım"] }
    }
  },
  "Endüstri Mühendisliği": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Analiz"], "Fizik": ["Genel Fizik"], "Bilgisayar Programlama": ["Python"], "Endüstri Mühendisliğine Giriş": ["Sistem yaklaşımı"], "Lineer Cebir": ["Matrisler"] },
      "2. Sınıf": { "Olasılık ve İstatistik": ["Olasılık dağılımları"], "Yöneylem Araştırması": ["Doğrusal programlama"], "Veri Tabanı Sistemleri": ["SQL"], "Mühendislik Ekonomisi": ["Maliyet analizleri"] },
      "3. Sınıf": { "Yöneylem Araştırması 2": ["Ağ modelleri"], "Üretim Planlama ve Kontrol": ["MRP/ERP"], "Kalite Mühendisliği": ["Altı Sigma"], "Benzetim": ["Simülasyon modelleri"], "İş Analizi ve Ergonomi": ["Zaman etüdü"] },
      "4. Sınıf": { "Tedarik Zinciri Yönetimi": ["Lojistik ağlar"], "Tesis Planlama": ["Yerleşim düzeni"], "Proje Yönetimi": ["PERT/CPM"], "Sistem Analizi ve Entegrasyonu": ["Sistem tasarımı"], "Mezuniyet Projesi": ["Bitirme Tezi"] }
    }
  },
  "İnşaat Mühendisliği": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Kalkülüs"], "Fizik": ["Mekanik"], "Kimya": ["Malzeme kimyası"], "Mühendislik Jeolojisi": ["Zemin yapıları"], "İnşaat Mühendisliğine Giriş": ["Mesleki temeller"], "Teknik Resim": ["AutoCAD"] },
      "2. Sınıf": { "Statik": ["Kuvvet dengesi"], "Mukavemet": ["Gerilme ve şekil değiştirme"], "Malzeme Bilimi": ["Yapı malzemeleri"], "Akışkanlar Mekaniği": ["Hidrostatik"], "Diferansiyel Denklemler": ["Matematiksel modeller"], "Topografya": ["Ölçme bilgisi"] },
      "3. Sınıf": { "Yapı Statiği 1-2": ["Çerçeve analizi"], "Hidrolik ve Su Kaynakları": ["Boru akışları"], "Zemin Mekaniği": ["Zemin davranışları"], "Betonarme": ["Donatılı beton"], "Ulaştırma Mühendisliği": ["Karayolu tasarımı"] },
      "4. Sınıf": { "Çelik Yapılar": ["Çelik konstrüksiyon"], "Temel Mühendisliği": ["Kazık temeller"], "Şantiye Yönetimi ve Maliyet Analizi": ["Metraj ve keşif"], "Bitirme Tasarım Projesi": ["Proje uygulaması"] }
    }
  },
  "Makine Mühendisliği": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Kalkülüs"], "Fizik": ["Fizik temelleri"], "Kimya": ["Temel Kimya"], "Mühendislik Çizimi": ["CAD tasarımı"], "Teknik İngilizce": ["Literatür tarama"] },
      "2. Sınıf": { "Statik": ["Kuvvet sistemleri"], "Dinamik": ["Kinematik"], "Mukavemet": ["Malzeme direnci"], "Termodinamik": ["Isı ve iş dönüşümleri"], "Malzeme Bilimi": ["Metalurji"] },
      "3. Sınıf": { "Akışkanlar Mekaniği": ["Navier-Stokes"], "Isı Transferi": ["İletim, taşınım, ışıma"], "Makine Elemanları": ["Dişliler, miller"], "Makine Teorisi ve Mekanizmalar": ["Kollar ve kamlar"], "İmalat Usulleri": ["Döküm, kaynak, talaşlı imalat"] },
      "4. Sınıf": { "Sistem Dinamiği ve Kontrol": ["Bode diyagramları"], "Isıtma Havalandırma (HVAC)": ["İklimlendirme"], "Isıl Sistem Tasarım": ["Kazan ve türbin"], "Mühendislik Tasarımı Projesi": ["Bitirme Projesi"] }
    }
  },
  "Yazılım Mühendisliği": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Algoritmalar": ["Temel mantık"], "Matematik": ["Analiz"], "Fizik": ["Genel Fizik"], "Yazılım Mühendisliğinin Temelleri": ["Giriş"], "Ayrık Yapılar": ["Mantık ve kümeler"], "Nesne Yönelimi": ["Temel OOP"] },
      "2. Sınıf": { "Nesne Yönelimli Programlama": ["Java/C++"], "Veri Yapıları ve Algoritmalar": ["Arama ve sıralama"], "Veri Tabanı Sistemleri": ["SQL"], "Web Geliştirme": ["HTML/CSS/JS"] },
      "3. Sınıf": { "Yazılım Mimarisi ve Tasarımı": ["Design Patterns"], "Yazılım Testi ve Doğrulama": ["Unit testler"], "Mobil Uygulama Geliştirme": ["Android/iOS"], "İnsan Bilgisayar Etkileşimi": ["UI/UX"] },
      "4. Sınıf": { "Bulut Bilişimi": ["AWS/Azure"], "Büyük Veri Analizi": ["Hadoop/Spark"], "Agile Süreç Yönetimi": ["Scrum"], "Yapay Öğrenme": ["Deep Learning"], "Yazılım Bitirme Projesi": ["Proje"] }
    }
  },
  "Havacılık ve Uzay Müh.": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Matematik": ["Kalkülüs"], "Fizik": ["Mekanik"], "Kimya": ["Temel Kimya"], "Bilgisayar Destekli Teknik Resim": ["SolidWorks"], "Havacılık Mühendisliğine Giriş": ["Uçuş prensipleri"] },
      "2. Sınıf": { "Statik": ["Kuvvetler"], "Dinamik": ["Hareket analizi"], "Termodinamik": ["Gaz kanunları"], "Malzeme Bilimi": ["Kompozitler"], "Diferansiyel Denklemler": ["Modelleme"], "Aerodinamik": ["Akışkan dinamikleri"] },
      "3. Sınıf": { "Aerodinamik 2": ["Sıkıştırılabilir akış"], "Uçuş Mekaniği": ["Performans ve kararlılık"], "İtki Sistemleri": ["Jet motorları"], "Uçak Yapıları": ["Kabuk yapı analizi"], "Kontrol Sistemleri": ["Otomatik pilot"] },
      "4. Sınıf": { "Hava ve Uzay Aracı Tasarımı": ["Konsept tasarım"], "Aviyonik Sistemler": ["Sensörler ve radar"], "Yörünge Mekaniği": ["Uzay uçuşu"], "Helikopter Teorisi": ["Rotatif kanat"], "Bitirme Tasarım Projesi": ["Bitirme Tezi"] }
    }
  },
  "Tıp Fakültesi": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf"],
    lessons: {
      "1. Sınıf": { "Tıbbi Biyoloji": ["Hücre döngüsü"], "Genetik": ["DNA ve Kalıtım"], "Biyofizik": ["Membran potansiyelleri"], "Tıbbi Biyokimya": ["Enzimler ve metabolizma"], "Anatomiye Giriş": ["Terminoloji"], "Hücre Bilimi": ["Organeller"] },
      "2. Sınıf": { "Anatomi": ["Sistemik Anatomi"], "Fizyoloji": ["Sistem fizyolojisi"], "Histoloji ve Embriyoloji": ["Dokular ve gelişim"], "Mikrobiyoloji": ["Bakteriyoloji ve viroloji"] },
      "3. Sınıf": { "Patoloji": ["Hastalıklar bilimi"], "Farmakoloji": ["İlaç bilimi"], "Klinik Bilimlere Giriş": ["Anamnez alma"], "Semiyoloji": ["Belirti ve bulgular"] },
      "4. Sınıf": { "İç Hastalıkları": ["Dahiliye"], "Genel Cerrahi": ["Cerrahi operasyonlar"], "Kadın Hastalıkları ve Doğum": ["Jinekoloji"], "Çocuk Sağlığı ve Hastalıkları": ["Pediatri"] },
      "5. Sınıf": { "Kardiyoloji": ["Kalp hastalıkları"], "Nöroloji": ["Sinir sistemi hastalıkları"], "Psikiyatri": ["Ruh sağlığı"], "Ortopedi": ["Kemik ve eklem cerrahisi"], "Göz Hastalıkları": ["Oftalmoloji"], "KBB": ["Kulak burun boğaz"], "Üroloji": ["İdrar yolları"], "Dermatoloji": ["Cildiye"] }
    }
  },
  "Diş Hekimliği Fakültesi": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf"],
    lessons: {
      "1. Sınıf": { "Diş Anatomisi ve Morfolojisi": ["Diş formları"], "Protezik Diş Tedavisi Pratiği": ["Modelaj"], "Tıbbi Biyoloji": ["Temel biyoloji"], "Biyokimya": ["Ağız biyokimyası"] },
      "2. Sınıf": { "Restoratif Diş Tedavisi Prekliniği": ["Dolgu uygulamaları"], "Endodonti": ["Kök kanal tedavisi temelleri"], "Anatomi": ["Baş-boyun anatomisi"], "Histoloji": ["Diş dokusu histolojisi"], "Maddeler Bilgisi": ["Dental materyaller"] },
      "3. Sınıf": { "Yapay Hastalar Üzerinde Pratik": ["Fantom laboratuvarı"], "Farmakoloji": ["Ağızda kullanılan ilaçlar"], "Patoloji": ["Oral patoloji"], "Ağız, Diş ve Çene Radyolojisi": ["Dental röntgen"], "Klinik Gözlem Stajları": ["Gözlem"] },
      "4. Sınıf": { "Ağız, Diş, Çene Cerrahisi": ["Diş çekimi"], "Periodontoloji": ["Dişeti hastalıkları"], "Ortodonti": ["Çapraşıklık tedavisi"], "Pedodonti": ["Çocuk diş hekimliği"], "Protez ve Restoratif Stajları": ["Aktif hasta bakımı"] },
      "5. Sınıf": { "İleri Çene Cerrahisi": ["İmplant operasyonları"], "Ağız Hastalıkları": ["Oral mukoza lezyonları"], "Çene Yüz Protezi": ["Maksillofasiyal protezler"], "Klinik Bölümlerde Kesintisiz Hasta Bakımı": ["Klinik staj"], "Bitirme Tezi": ["Araştırma projesi"] }
    }
  },
  "Hemşirelik Fakültesi": {
    grades: ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
    lessons: {
      "1. Sınıf": { "Anatomi": ["İnsan vücudu yapıları"], "Fizyoloji": ["Vücut fonksiyonları"], "Mikrobiyoloji": ["Sterilizasyon ve enfeksiyon"], "Biyokimya": ["Temel biyokimya"], "Hemşirelik Esasları": ["Bakım modelleri ve beceriler"] },
      "2. Sınıf": { "İç Hastalıkları Hemşireliği": ["Dahili bakım"], "Cerrahi Hastalıkları Hemşireliği": ["Ameliyat öncesi/sonrası bakım"], "Farmakoloji": ["İlaç uygulama ilkeleri"], "Patoloji": ["Hastalık temelleri"], "Klinik Uygulamalar": ["Hastanede saha çalışması"] },
      "3. Sınıf": { "Doğum ve Kadın Hastalıkları Hemşireliği": ["Anne-çocuk sağlığı"], "Çocuk Sağlığı ve Hastalıkları Hemşireliği": ["Pediatrik bakım"], "Ruh Sağlığı ve Psikiyatri Hemşireliği": ["Psikiyatrik bakım"], "Biyoistatistik": ["Araştırma verileri"] },
      "4. Sınıf": { "Halk Sağlığı Hemşireliği": ["Toplum sağlığı"], "Hemşirelikte Yönetim ve Liderlik": ["Klinik yönetimi"], "Hemşirelik Tarihi ve Deontoloji": ["Etik kurallar"], "İntern Hemşirelik Pratiği": ["Saha intörnlüğü"] }
    }
  }
};

export default function AICoach() {
  // Alan, Sınıf ve Bölüm Seçim State'leri
  const [selectedCategory, setSelectedCategory] = useState<string>("8. Sınıf (LGS)");
  const [selectedGrade, setSelectedGrade] = useState<string>("8. Sınıf");

  // Çalışma Kriterleri
  const [totalHours, setTotalHours] = useState('3');
  const [motivation, setMotivation] = useState('Orta 😊');
  const [extraDetails, setExtraDetails] = useState('');

  // Seçilen Dersler ve Konular (Map: Ders -> Konu Listesi)
  const [selectedLessonsAndTopics, setSelectedLessonsAndTopics] = useState<Record<string, string[]>>({});

  const [schedule, setSchedule] = useState<Session[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Merhaba! Ben senin yapay zeka koçunum. Sol taraftan kademeni ve derslerin altındaki çalışmak istediğin konuları seçebilir, günlük süreni ve motivasyonunu belirleyerek akıllı programını oluşturabilirsin! 🎯' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const motivations = ['Düşük 🥱', 'Orta 😊', 'Yüksek 🔥'];

  // Kategori değiştiğinde sınıf ve dersleri güncelle
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const grades = CURRICULUM_DATA[cat]?.grades || [];
    if (grades.length > 0) {
      setSelectedGrade(grades[0]);
    }
    setSelectedLessonsAndTopics({});
  };

  const currentLessonsMap = CURRICULUM_DATA[selectedCategory]?.lessons[selectedGrade] || {};

  // Konu seçimi toggle
  const toggleTopicSelection = (lesson: string, topic: string) => {
    const currentTopics = selectedLessonsAndTopics[lesson] || [];
    if (currentTopics.includes(topic)) {
      const updated = currentTopics.filter(t => t !== topic);
      if (updated.length === 0) {
        const copy = { ...selectedLessonsAndTopics };
        delete copy[lesson];
        setSelectedLessonsAndTopics(copy);
      } else {
        setSelectedLessonsAndTopics({ ...selectedLessonsAndTopics, [lesson]: updated });
      }
    } else {
      setSelectedLessonsAndTopics({
        ...selectedLessonsAndTopics,
        [lesson]: [...currentTopics, topic]
      });
    }
  };

  // LocalStorage'dan yükleme
  useEffect(() => {
    const saved = localStorage.getItem('nexore_ai_coach_schedule');
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch (e) {
        console.error("Program yüklenemedi", e);
      }
    }
  }, []);

  const saveSchedule = (newSchedule: Session[]) => {
    setSchedule(newSchedule);
    localStorage.setItem('nexore_ai_coach_schedule', JSON.stringify(newSchedule));
  };

  // A — Akıllı Program Oluşturucu
  const handleGenerateSchedule = async () => {
    if (Object.keys(selectedLessonsAndTopics).length === 0) {
      alert('Lütfen en az bir ders ve konu seçin!');
      return;
    }

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        alert('Gemini API anahtarı bulunamadı! Lütfen .env.local dosyasını kontrol edin.');
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const selectionSummary = Object.entries(selectedLessonsAndTopics)
        .map(([lesson, topics]) => `${lesson} (${topics.join(', ')})`)
        .join('; ');

      const prompt = `
        Öğrenci Kademesi/Bölümü: ${selectedCategory} - Sınıf: ${selectedGrade}.
        Günlük toplam çalışma süresi: ${totalHours} saat.
        Motivasyon durumu / Ruh hali: ${motivation}.
        Öğrencinin özellikle çalışmak istediği dersler ve konular: ${selectionSummary}.
        Ekstra detaylar: "${extraDetails || 'Yok'}".
        
        Lütfen bu verilere dayanarak Pomodoro mantığıyla (odaklanma ve mola blokları, ders ve konu eşleştirmeli) gerçekçi bir çalışma programı oluştur.
        Sadece saf JSON dizisi (array of objects) olarak şu formatta dön, başka hiçbir açıklama yazma (markdown blokları kullanma):
        [
          {"lesson": "Matematik", "topic": "Kareköklü İfadeler", "duration": 40, "type": "Çalışma"},
          {"lesson": "Mola", "duration": 10, "type": "Mola"},
          {"lesson": "Türkçe", "topic": "Fiilimsiler", "duration": 35, "type": "Çalışma"}
        ]
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      let resText = response.text || '';
      resText = resText.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedSessions: Session[] = JSON.parse(resText);

      saveSchedule(generatedSessions);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: `Bugün ${totalHours} saat, ${motivation} motivasyonla şu konulara çalışacağım: ${selectionSummary}` },
        { role: 'assistant', content: 'Harika bir program hazırladım! Aşağıdan inceleyebilirsin. Programı değiştirmek istersen bana her zaman yazabilirsin.' }
      ]);
    } catch (error) {
      console.error("Program oluşturulamadı:", error);
      alert('Program oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // B — AI Sohbet ile Programı Güncelleme
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Mevcut çalışma programı: ${JSON.stringify(schedule)}
        Öğrencinin mesajı: "${newMsg}"
        
        Öğrencinin bu isteğine göre (örneğin süreyi azaltma, ders/konu çıkarma veya ekleme) çalışma programını güncelle.
        Yanıtı şu saf JSON formatında dön (kesinlikle başka metin ekleme, markdown kullanma):
        {
          "replyMessage": "Öğrenciye vereceğin koçluk cevabı",
          "updatedSchedule": [
            {"lesson": "Ders Adı", "topic": "Konu Adı", "duration": 30, "type": "Çalışma"}
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: ' gemini-3.5-flash',
        contents: [prompt],
      });

      let resText = response.text || '';
      resText = resText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(resText);

      if (data.updatedSchedule && Array.isArray(data.updatedSchedule)) {
        saveSchedule(data.updatedSchedule);
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.replyMessage }]);
    } catch (error) {
      console.error("Sohbet hatası:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, şu an isteğini işleyemedim ama seni dinliyorum.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Üst Başlık */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-amber-200/60 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700/75"> • Akıllı Asistan</span>
          <h1 className="text-2xl font-extrabold text-amber-950">🤖 AI Koç & Kapsamlı Program Oluşturucu</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Panel: Kademeler, Konular ve Ayarlar */}
        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-200/80 space-y-5 lg:col-span-1">
          <h2 className="text-base font-extrabold text-amber-950">⚙️ Sınıf, Ders ve Konu Seçimi</h2>
          
          {/* Kategori / Sınıf Seçimi */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-900">Eğitim Kademesi / Bölüm</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-900 focus:outline-none"
            >
              {Object.keys(CURRICULUM_DATA).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Çalışma Süresi ve Motivasyon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Süre (Saat)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Ruh Hali / Motivasyon</label>
              <select
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-xs font-semibold text-amber-900 focus:outline-none"
              >
                {motivations.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Dersler ve Alt Konular Alanı */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 border-t border-b border-amber-100 py-3">
            <label className="block text-xs font-bold text-amber-900">Dersler ve Çalışılacak Konular:</label>
            {Object.keys(currentLessonsMap).length === 0 ? (
              <p className="text-xs text-gray-400 italic">Konu bulunamadı.</p>
            ) : (
              Object.entries(currentLessonsMap).map(([lessonName, topics]) => (
                <div key={lessonName} className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 space-y-2">
                  <span className="text-xs font-extrabold text-amber-950 block">📖 {lessonName}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map(topic => {
                      const isSelected = selectedLessonsAndTopics[lessonName]?.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopicSelection(lessonName, topic)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-100'
                          }`}
                        >
                          {topic} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">Ekstra Detaylar (İsteğe Bağlı)</label>
            <input
              type="text"
              placeholder="Örn: Akşam sporum var, molalar uzun olsun..."
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-900 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerateSchedule}
            disabled={loading}
            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            {loading ? 'Program Hazırlanıyor... ⏳' : 'Akıllı Program Oluştur 🚀'}
          </button>
        </div>

        {/* Sağ Panel: Güncel Program & AI Sohbet */}
        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-200/80 space-y-6 lg:col-span-2 flex flex-col justify-between">
          
          {/* Güncel Program Görüntüleme */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-amber-950">📅 Bugünkü Çalışma Programın</h2>
            {schedule.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-xl border">Henüz bir program oluşturulmadı. Sol taraftan derslerini ve konularını seçip akıllı program oluşturabilirsin.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {schedule.map((session, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded-xl border text-xs font-bold ${session.type === 'Mola' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-950'}`}>
                    <div className="space-y-0.5">
                      <span>{session.type === 'Mola' ? '☕ Mola' : `📖 ${session.lesson}`}</span>
                      {session.topic && <span className="block text-[11px] font-normal text-gray-600">Konu: {session.topic}</span>}
                    </div>
                    <span className="px-2.5 py-1 bg-white rounded-lg shadow-xs">{session.duration} dakika</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Sohbet Alanı */}
          <div className="space-y-3 pt-4 border-t border-amber-100 flex-1 flex flex-col justify-between">
            <h2 className="text-sm font-extrabold text-amber-950">💬 AI Koç ile Canlı Sohbet & Program Güncelleme</h2>
            
            <div className="bg-gray-50 rounded-2xl p-4 h-44 overflow-y-auto space-y-3 border border-gray-100">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-amber-700 text-white rounded-br-none' : 'bg-white text-gray-800 border border-amber-200 rounded-bl-none shadow-xs'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-gray-400 italic">AI koç düşünüyor ve programı güncelliyor...</div>}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Örn: Bugün çok yoruldum süreyi 2 saate indir, ya da matematiği çıkar..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-amber-200 text-xs bg-amber-50/30 focus:outline-none text-gray-800"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                Gönder 🚀
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}