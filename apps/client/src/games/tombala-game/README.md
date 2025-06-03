# Tombala (Bingo) Oyunu 

Bu proje, **React**, **TypeScript** ve **Firebase** teknolojileri kullanılarak geliştirilmiş gerçek zamanlı çok oyunculu bir Tombala (Bingo) oyunudur. Kullanıcılar benzersiz bir oda kodu ile lobi oluşturup katılabilir, kartlarındaki sayıları işaretleyerek satır veya tam kart tamamlamaya çalışır.

## Özellikler

- Gerçek zamanlı senkronizasyon: Firebase **Firestore**
- Kullanıcı kimlik doğrulama: Firebase Authentication (E-posta/Şifre, Facebook)
- Lobi yönetimi: Oluşturma, katılma, şifreleme, normal/etkinlik seçimi
- Kurucu lobiden ayrılırsa `Leave Lobby` ile çıkış
- Otomatik kapanma: normal lobiler kurucu ayrıldıktan 8 saat sonra, etkinlik lobileri bitiş zamanında kapanır
- Cloud Functions: `closeExpiredRooms` ile süresi geçen lobileri her saat kapatır
- Çoklu dil desteği: i18next & react-i18next
- Modern ve duyarlı arayüz: MUI + Tailwind CSS
- Akıcı animasyonlar: framer-motion
- Ses efektleri ve bildirimler: Howler & react-hot-toast
- Route yönetimi: react-router-dom

## Hızlı Kurulum

### Gereksinimler

- Node.js v16+ ve npm veya yarn
- Firebase projesi ve `.env` yapılandırması

### Adımlar

```bash
git clone https://github.com/mtgsoftworks/Game-Center.git
cd Game-Center/package/games/game_tombala
npm install       # veya yarn install
cp .env.example .env
# .env içine Firebase ayarlarınızı ekleyin
npm run dev       # veya yarn dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

## Oyun Kuralları

1. Her oyuncuya **5×5** sayısal bir tombala kartı verilir.
2. Oda kurucusu (host), belirlenen zaman aralıklarında rastgele bir sayı çeker.
3. Çekilen sayı, kartınızdaki ilgili hücre işaretlenir.
4. Kart üzerinde **tek bir satır, sütun veya çapraz** tamamlayan oyuncu "Satır Tombala" kazanır.
5. Tüm hücreleri işaretleyen oyuncu "Full Tombala" (Tam Kart) elde eder ve oyun sona erer.
6. Birden fazla kazanan olması durumunda **ilk tamamlanan** oyuncu galip sayılır.

## Proje Yapısı

```
game_tombala/
├── public/                # Statik dosyalar ve dil çeviri JSON'ları
├── src/
│   ├── assets/            # Resimler ve statik varlıklar
│   ├── components/        # React bileşenleri (Auth, Lobby, GameRoom, Shared)
│   ├── contexts/          # React Context sağlayıcıları (AppContext)
│   ├── services/          # Firebase hizmetleri ve API çağrıları
│   ├── i18n/              # i18n çeviri dosyaları (en, tr)
│   ├── App.tsx            # Ana uygulama ve yönlendirme yapılandırması
│   └── main.tsx           # Uygulama başlangıç noktası
├── .env.example           # Ortam değişkenleri şablonu
├── package.json           # Bağımlılıklar ve script'ler
├── ARCHITECTURE.md        # Proje mimarisi dokümanı
└── README.md              # Bu doküman
```

## Teknoloji Yığını

- **Frontend:** React (Vite), TypeScript, MUI, Tailwind CSS
- **Durum Yönetimi:** React Context & Reducer
- **Gerçek Zamanlı:** Firebase **Firestore**
- **Kimlik Doğrulama:** Firebase Authentication
- **Animasyon:** framer-motion
- **Ses & Bildirim:** Howler, react-hot-toast
- **Yönlendirme:** react-router-dom

## Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır.
