import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Flashcard oluşturmak için metin gerekli.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_FLASHCARD_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Flashcard API anahtarı sunucuda bulunamadı.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Sen bir eğitim uzmanısın.

Aşağıdaki ders notunu analiz et ve öğrencinin tekrar yapmasına
yardımcı olacak kaliteli flashcard'lar oluştur.

Kurallar:
- En önemli bilgileri seç.
- Gereksiz veya çok kolay sorular oluşturma.
- Sorular kısa ve net olsun.
- Cevaplar doğru, anlaşılır ve mümkün olduğunca kısa olsun.
- Tanımlar, formüller, önemli kavramlar ve ilişkiler üzerinde dur.
- Metinde olmayan bilgileri uydurma.
- 5 ile 15 arasında flashcard oluştur.
- Çıktıyı SADECE geçerli bir JSON dizisi olarak ver.
- Markdown şablonu (örneğin \`\`\`json) KULLANMA.
- Açıklama yazma.

JSON format örneği:
[
  {
    "question": "Soru metni",
    "answer": "Cevap metni"
  }
]

DERS NOTU:
${text.slice(0, 12000)}
`;

    // Google'ın önerdiği güncel model
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error('Gemini boş yanıt döndürdü.');
    }

    const cleanedText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const cards = JSON.parse(cleanedText);

    if (!Array.isArray(cards)) {
      throw new Error('Geçerli bir kart listesi üretilemedi.');
    }

    const validCards = cards
      .filter(
        (card: any) =>
          card &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string' &&
          card.question.trim() &&
          card.answer.trim()
      )
      .map((card: any) => ({
        question: card.question.trim(),
        answer: card.answer.trim(),
      }));

    if (validCards.length === 0) {
      throw new Error('Geçerli flashcard oluşturulamadı.');
    }

    return NextResponse.json({ cards: validCards });
  } catch (error: any) {
    console.error('Flashcard API Hatası:', error);
    return NextResponse.json(
      { error: error.message || 'AI yanıt üretirken hata oluştu.' },
      { status: 500 }
    );
  }
}