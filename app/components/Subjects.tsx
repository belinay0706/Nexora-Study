interface SubjectsProps {
  selectedLevel?: string;
}

export default function Subjects({ selectedLevel }: SubjectsProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-slate-200">
      <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-800 space-y-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Gizlilik Politikası</h1>
        <p className="text-sm text-slate-400">Son güncelleme tarihi: Ağustos 2026</p>
        
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Belora Study olarak kullanıcımızın gizliliğine büyük önem veriyoruz. Bu gizlilik politikası belgesi, toplanan kişisel bilgilerin türlerini ve nasıl kullanıldığını açıklar.
          </p>
          <h2 className="text-base font-bold text-white pt-2">Toplanan Bilgiler</h2>
          <p>
            Sistemimize kayıt olurken veya Google ile giriş yaparken e-posta adresiniz ve adınız gibi temel bilgiler, uygulama içindeki deneyiminizi kişiselleştirmek amacıyla güvenli veritabanımızda saklanır.
          </p>
          <h2 className="text-base font-bold text-white pt-2">Çerezler ve Reklam</h2>
          <p>
            Sitemizde üçüncü taraf reklam ortakları (Google AdSense vb.) çerezler (cookies) kullanabilir. Google, çerezler aracılığıyla kullanıcılarımıza sitemize yaptıkları ziyaretlere dayalı reklamlar sunar.
          </p>
        </div>
      </div>
    </div>
  );
}