# Oyun Merkezi

Oyun Merkezi, gündelik oyunlar oynamak ve gerçek zamanlı lobilerde sohbet etmek için geliştirilmiş tam stack bir web uygulamasıdır. Lerna tabanlı monorepo yapısına sahiptir ve şunları içerir:

- **Arka Uç**: Node.js v22 + Express ile, express-session & memorystore kullanarak oturum yönetimi; Firebase Kimlik Doğrulama (Google & e-posta/şifre), Firestore, cookie-parser, body-parser, helmet, compression, morgan ve sohbet için WebSocket.
- **Ön Uç**: React 18, MUI v6, Context API, React Query, React Router v6, i18next (react-i18next), react-material-table, react-number-format ve PWA desteği.
- **Oyunlar**: Lerna ile yönetilen paketler (örn. 2048 ve Tombala), React `lazy`/`Suspense` ile dinamik yüklenir.

---

## Sürüm Notları

### v0.6 (2025-05-23)
- Sohbet mesajlarında gönderici avatar/isim yükleme hatası (`Cannot read properties of undefined (reading 'avatar')`) düzeltildi. `useChatMessages.js` hook'u, gönderici profil bilgilerini Firestore'dan çekerek mesaj nesnelerine ekleyecek şekilde güncellendi.
- Dil değiştirildiğinde bu değişikliğin anında tüm sayfalara yansıması sağlandı. `LanguageSelector.js` artık seçilen dili `localStorage`'a kaydediyor ve ana uygulama (`src/index.js`) `I18nextProvider` ile sarmalanarak dil değişikliklerinin tutarlı yayılımı iyileştirildi.
- Arkadaşlık sistemi ve Firebase entegrasyonu detaylıca incelendi.

### v0.7 (2025-05-30)
- Tombala İstatistikleri: Ana menüde Tombala liderlik tablosu ve başarımlar modalı eklendi.
- Tombala Lobileri: Ana sayfada Tombala ve etkinlik lobileri listeleniyor; etkinlikler için geri sayım ve durum gösterimi sağlandı.

### v0.8 (2025-06-03)
- Stats Aggregate: `/api/games/stats/aggregate` endpoint'i eklendi (oyun ve tarih aralığı bazlı toplu istatistikler).
- Frontend Servisleri: `statsService.fetchAggregateStats` ve `leaderboardService.subscribeLeaderboard` oluşturuldu.
- Realtime Leaderboards: Firebase RTDB ile liderlik tabloları anlık güncelleme destekliyor.

### v0.5 (2025-04-28)
- Tüm dosyalara kapsamlı Türkçe yorumlar eklendi ve kod okunabilirliği artırıldı.

### v0.4 (2025-04-28)
- 2048 ve Tombala için oyun resimleri eklendi.
- Navbar bileşenine açık/koyu tema düğmesi eklendi.
- AppContext güncellendi (tema ve dil yönetimi).
- i18n çevirilerine yeni anahtarlar eklendi.
- Anasayfa tasarım iyileştirmeleri, istatistik gösterimi eklendi.
- Ayarlar sayfası tema seçimi destekleyecek şekilde güncellendi.
- gameService API uç noktaları güncellendi.
- game_2048 ve game_tombala paket dokümantasyonuna mimari detayları eklendi.

### v0.3 (2025-04-27)
- Redux Toolkit yerine Context API'ye geçildi.
- MUI v6'ya yükseltildi.
- LobiYönetimiSayfası'nda MUI Tablosu yerine react-material-table kullanıldı.
- Anasayfa'da react-number-format ile sayı formatlaması eklendi.
- Oturum yönetimi için express-session & memorystore entegre edildi.
- Güvenlik ve performans için cookie-parser, body-parser, helmet, compression, morgan middlewares eklendi.
- Node.js motoru >=22 olarak ayarlandı.

### v0.2 (2025-04-27)
- Lobi düzenleme ve silme (`src/pages/EditLobbyPage.js`).
- Etkinlik zamanlaması ile tarih-saat seçicileri ve geri sayım sayaçları.
- Lobi listeleme ve oluşturma `GameDetailPage.js` içinde.
- Tarayıcı Bildirim API'si ile sohbet bildirimleri.
- Genişletilmiş i18n desteği (İngilizce & Türkçe).

---

## Özellikler
- 🔐 Firebase Auth (Google & E-posta/Şifre) ile kullanıcı kimlik doğrulama
- 💬 Lobilerde gerçek zamanlı sohbet (maks. 4 katılımcı) WebSocket ile
- 🎮 2048 ve Tombala oyunları, yönergeler ve görsellerle
- 🎨 Ayarlar sayfasında Açık/Koyu tema geçişi
- 📦 MUI bileşen tabanlı mimari
- ⚛️ Durum yönetimi Context API & React Query
- 📊 Tablo işlemleri için react-material-table
- 🔢 Sayı formatlama react-number-format ile
- 🛡️ Güvenlik: helmet, rate limiting, input sanitization
- 🌐 PWA: çevrimdışı destek ve manifest
- 🧪 Testler: Jest + React Testing Library (birim), Cypress (E2E)
- 📚 Belgeler: Storybook & `TECHNICAL_DOCUMENTATION.md`

---

## Başlarken

### Ön Koşullar
- Node.js v22 veya üzeri
- Yarn paket yöneticisi
- Firebase projesi için Service Account JSON

### Kurulum
```bash
# Depoyu klonlayın
git clone https://github.com/mtgsoftworks/Game-Center.git
cd Game-Center

# Paketleri yükleyin
yarn install
```

### Ortam Değişkenleri
Örnek `.env` dosyalarını kopyalayın ve değerlerinizi girin:

```bash
# Arka Uç
cp package/game-center-backend/.env.example package/game-center-backend/.env
# Ön Uç
cp package/game-center-frontend/.env.example package/game-center-frontend/.env
```

#### Arka Uç `.env`
```
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS_JSON='<SERVICE_ACCOUNT_JSON>'
FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
```

#### Ön Uç `.env`
```
REACT_APP_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
```

### Yerel Çalıştırma
```bash
# Arka Uç
cd package/game-center-backend
yarn dev

# Ön Uç (yeni terminal)
cd package/game-center-frontend
yarn start
```

- Ön Uç: http://localhost:3000
- Arka Uç API: http://localhost:3001/api

---

## Testler

```bash
# Birim testleri çalıştırın
yarn test

# E2E testleri Cypress ile çalıştırın
yarn workspace game-center-frontend cypress open
```

---

## Dağıtım

### Arka Uç

- Docker imajını oluşturun:
  ```bash
  docker build -t game-center-backend ./package/game-center-backend
  ```
- Konteynırı ortam değişkenleriyle çalıştırın:
  ```bash
  docker run -d \
    -e GOOGLE_APPLICATION_CREDENTIALS_JSON="<SERVICE_ACCOUNT_JSON>" \
    -e FIREBASE_* \
    -p 3001:3001 game-center-backend
  ```

### Ön Uç

- Statik dosyaları oluşturun:
  ```bash
  cd package/game-center-frontend
  yarn build
  ```
- `build/` klasörünü herhangi bir statik barındırma hizmetine (Netlify, Vercel, S3+CloudFront) dağıtın.

---

## Katkıda Bulunma

Lütfen `TECHNICAL_DOCUMENTATION.md`'yi okuyun ve kodlama standartlarına uyun.

1. Deposunu çatalla
2. Özellik dalı oluştur
3. Düzenleme ve test kurallarına uyun
4. Çekme isteği gönderin

---

## Lisans

MIT Lisansı