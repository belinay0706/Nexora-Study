import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedLevel, studyHours, mood, extraNotes, selectedTopics } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    
    const prompt = `Bir eğitim koçu olarak şu kriterlere göre bir çalışma programı hazırla:
    - Seviye: ${selectedLevel || 'belirtilmedi'}
    - Günlük Çalışma Saati: ${studyHours || 'belirtilmedi'}
    - Mod / Durum: ${mood || 'belirtilmedi'}
    - Odaklanılacak Konular: ${selectedTopics && selectedTopics.length > 0 ? selectedTopics.join(', ') : 'belirtilmedi'}
    - Ek Notlar: ${extraNotes || 'yok'}
    
    Lütfen yanıtı sade bir metin veya anlaşılır bir plan olarak ver.`;

    // Ücretsiz katmanda çalışan en popüler ve hızlı model (gemini-1.5-flash) ve v1 uç noktası
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(apiData.error?.message || 'Google API Hatası');
    }

    const text = apiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Model boş yanıt döndürdü.');
    }

    return NextResponse.json({ plan: { summary: text } });
    
  } catch (error: any) {
    console.error('API Hatası Detayı:', error);
    return NextResponse.json({ error: error.message || 'AI yanıt üretirken hata oluştu.' }, { status: 500 });
  }
}