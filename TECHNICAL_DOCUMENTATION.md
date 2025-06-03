# Oyun Merkezi - Ultra Detaylı Teknik Dokümantasyon

## Genel Bakış
Oyun Merkezi, çoklu oyunları ve gerçek zamanlı sosyal etkileşimi destekleyen, Lerna ile yönetilen bir monorepo mimarisine sahip tam kapsamlı bir web uygulamasıdır. Proje, modern web teknolojilerinin tamamını kapsayan bir full-stack çözüm sunar. Aşağıda kullanılan tüm teknolojik altyapı, mimari kararlar ve sistemin çalışma prensipleri ultra detaylı olarak açıklanmıştır.

---

## Monorepo ve Lerna
- **Lerna**: Monorepo yönetimi için kullanılır. Birden fazla bağımsız paketi (oyunlar, frontend, backend) tek depo altında yönetmeyi sağlar.
- **Avantajları**: Ortak bağımlılıkların merkezi yönetimi, paketler arası kolay paylaşım, hızlı geliştirme, sürüm takibi ve CI/CD entegrasyonu.
- **Yapı**:
  ```
  /game-center
  ├── lerna.json
  ├── package.json
  ├── README.md
  ├── TECHNICAL_DOCUMENTATION.md
  └── package/
      ├── game-center-backend/
      ├── game-center-frontend/
      └── games/
          ├── game_2048/
          └── game_tombala/
  ```

---

## Backend (Arka Uç)
- **Node.js v22+**: Sunucu tarafı JavaScript runtime'ı. Modern async/await desteği ve performans için seçildi.
- **Express.js**: REST API ve sunucu yönlendirmeleri için ana framework.
- **Firebase Admin SDK**: Kimlik doğrulama ve Firestore erişimi için kullanılır. Sunucu tarafında güvenli token doğrulama ve veri yönetimi sağlar.
- **Firestore**: Gerçek zamanlı NoSQL veritabanı. Oyun odası, kullanıcı, sohbet ve oyun verileri burada tutulur.
- **Oturum Yönetimi**: `express-session` ve `memorystore` ile kullanıcı oturumları yönetilir.
- **Ara Katmanlar (Middleware)**: `cookie-parser`, `body-parser`, `helmet`, `compression`, `morgan`, `cors` ile güvenlik, loglama ve performans artırılır.
- **Rate Limiting & Input Sanitization**: DDoS saldırılarına ve kötü niyetli girişimlere karşı koruma sağlar.
- **Stats Aggregate Endpoint**: GET `/api/games/stats/aggregate?game=<tombala|2048>&from=<ISO>&to=<ISO>` — belirli oyun ve tarih aralığı için toplu istatistikler döner (count, totalScore, avgScore, minScore, maxScore, totalDuration, avgDuration).
- **Realtime Leaderboards (RTDB)**: Tombala ve 2048 liderlik tablosu Firestore'dan alındıktan sonra Firebase Realtime Database'e (`/leaderboards/{game}`) yazılır ve istemciler `subscribeLeaderboard` fonksiyonu ile gerçek zamanlı takip edebilir.

**Temel Backend Dosyaları:**
- `server.js`: Sunucu başlatma, middleware, rotalar ve hata yönetimi.
- `controllers/`: Kimlik doğrulama, oyun ve lobi iş mantığı.
- `routes/`: `/api/auth`, `/api/games`, `/api/lobbies` gibi API uç noktaları.
- `middleware/authMiddleware.js`: Firebase token doğrulama.
- `utils/sendEmail.js`: E-posta gönderimi.

---

## Frontend (Ön Uç)
- **React 18**: Bileşen tabanlı, hızlı ve yeniden kullanılabilir arayüzler sağlar.
- **TypeScript**: Tüm frontend ve oyun kodlarında kullanılır. Tip güvenliği ve ölçeklenebilirlik sağlar.
- **Material UI (MUI v6)**: Modern, erişilebilir ve özelleştirilebilir UI bileşenleri.
- **React Router v6**: SPA'da sayfa geçişleri ve korumalı rotalar için.
- **Context API**: Kimlik, bildirim, tema ve ses gibi global state yönetimi.
- **React Query**: API'den veri çekme, önbellekleme ve güncelleme için.
- **i18next (react-i18next)**: Çoklu dil desteği sağlar.
- **Framer Motion**: Animasyon ve geçiş efektleri için.
- **React Hot Toast**: Bildirimler için.
- **Tailwind CSS/PostCSS**: Hızlı ve özelleştirilebilir stil yönetimi.
- **PWA (Progressive Web App)**: Çevrimdışı çalışma, ana ekrana ekleme ve manifest desteği.
- **Jest & React Testing Library**: Birim testleri.
- **Cypress**: Uçtan uca (E2E) testler.
- **Storybook**: Bileşen dokümantasyonu ve görsel testler.

**Temel Frontend Dosyaları:**
- `src/pages/`: Ana sayfa, kimlik, lobi, oyun ve ayar sayfaları.
- `src/components/`: UI ve oyun bileşenleri.
- `src/services/`: API istemcileri ve servisler (örn. `statsService.js`, `leaderboardService.js`).
- `src/services/statsService.js`: `fetchAggregateStats` — aggregate endpoint çağrısı.
- `src/services/leaderboardService.js`: `subscribeLeaderboard` — RTDB aboneliği.
- `src/contexts/`: Global state context dosyaları.
- `src/routes/`: Rota tanımları ve korumalı rotalar.
- `src/i18n/index.js`: Dil yönetimi. Dil değişikliği artık `localStorage`'da saklanarak kalıcı hale getirildi. Uygulama, dil değişikliklerinin tutarlı yayılımı için `src/index.js` içinde `I18nextProvider` ile sarmalandı.
- `src/hooks/useChatMessages.js`: Sohbet mesajlarını yönetir. Mesajlar yüklenirken, her mesajın `senderId`'si kullanılarak göndericinin profil bilgileri (isim, avatar) Firestore'dan çekilip mesaj nesnesine `sender` olarak eklenmesi sağlandı. Bu, sohbet arayüzünde kullanıcı bilgilerinin doğru görüntülenmesini sağlar.

---

## Oyunlar (Paketler)
### game_2048
- **Teknolojiler**: React, TypeScript, Context API, CSS modülleri
- **Özellikler**: 2048 oyununun tüm mantığı, hareket algoritmaları, skor ve kazanma/kaybetme kontrolü, Türkçe açıklamalı kodlar.

### game_tombala
- **Teknolojiler**: React, TypeScript, MUI, Firebase Firestore, Context API, Framer Motion, i18next
- **Özellikler**: Gerçek zamanlı tombala oyunu, kart üretimi, numara çekilişi, çoklu oyuncu desteği, animasyonlar, çoklu dil desteği, Türkçe açıklamalı kodlar.
-  - Ana sayfada Tombala Lobileri: Gerçek zamanlı lobiler listeleniyor, etkinlik lobileri için geri sayım ve durum bilgisi gösteriliyor.
-  - Tombala İstatistikleri Modalı: Ana menüde liderlik tablosu ve başarımlar modalı ile kullanıcı istatistikleri sunuluyor.

---

## Ortak ve Destekleyici Teknolojiler
- **Yarn**: Paket yönetimi.
- **ESLint & Prettier**: Kod kalitesi ve biçimlendirme.
- **dotenv**: Ortam değişkenleri yönetimi.
- **Docker**: Geliştirme ve dağıtım için konteyner desteği.
- **GitHub Actions**: CI/CD, otomatik test ve dağıtım.
- **Netlify/Vercel**: Frontend dağıtımı.
- **Heroku/GCP**: Backend dağıtımı.

---

## Güvenlik & Performans
- **Kimlik Doğrulama**: Firebase Auth ve sunucu tarafında token doğrulama.
- **Oturum Yönetimi**: express-session ve memorystore.
- **Güvenlik Middleware'ları**: helmet, rate limiting, input sanitization.
- **Gerçek Zamanlı Veri**: Firestore ve WebSocket ile anlık güncellemeler.
- **PWA**: Çevrimdışı çalışma ve hızlı yükleme.

---

## Test & Kalite
- **Jest & React Testing Library**: Birim testleri.
- **Cypress**: Uçtan uca testler.
- **Storybook**: Bileşenlerin dokümantasyonu ve görsel testleri.
- **CI/CD**: GitHub Actions ile otomatik test ve dağıtım.

---

## Sık Sorulan Sunum Soruları ve Cevapları
### 1. Projenin mimari yapısı nasıl?
**Cevap:** Lerna ile yönetilen monorepo, her oyun ve ana uygulamanın ayrı paketlerde, ortak bağımlılıkların merkezi olarak tutulduğu, ölçeklenebilir ve sürdürülebilir bir yapı sunar.

### 2. Neden monorepo tercih ettiniz?
**Cevap:** Çoklu oyun ve uygulama geliştirme, ortak kod paylaşımı ve merkezi yönetim için monorepo kullanıldı. Lerna ile paketler arası bağımlılıklar kolayca yönetiliyor.

### 3. Gerçek zamanlı veri nasıl sağlanıyor?
**Cevap:** Firebase Firestore ile oyun ve sohbet verileri anlık olarak tüm istemcilere senkronize edilir. Sohbet mesajlarında gönderici kullanıcı bilgileri (avatar, isim) artık doğru bir şekilde yüklenmektedir. WebSocket ile gerçek zamanlı sohbet ve bildirimler desteklenir.

### 4. Kullanıcı kimlik doğrulama nasıl çalışıyor?
**Cevap:** Firebase Auth ile e-posta/şifre veya Google ile giriş yapılır. Tokenlar backend'de doğrulanır, güvenli erişim sağlanır.

### 5. Çoklu dil desteği nasıl sağlanıyor?
**Cevap:** i18next ile arayüzdeki tüm metinler dinamik olarak çevrilebilir. Dil değişikliği `localStorage`'da saklanır ve `I18nextProvider` sayesinde anında tüm bileşenler güncellenir.

### 6. Oyun mantığı ve algoritmalar nasıl tasarlandı?
**Cevap:** Her oyunun kuralları ayrı yardımcı dosyalarda ve bileşenlerde yönetilir. Fonksiyonel ve test edilebilir algoritmalar yazılmıştır.

### 7. Kod kalitesini ve sürdürülebilirliği nasıl sağlıyorsunuz?
**Cevap:** TypeScript ile tip güvenliği, ESLint ve Prettier ile kod standardı sağlanır. Detaylı Türkçe açıklamalar ile kod okunabilirliği artırılır.

### 8. Projede güvenlik önlemleri nelerdir?
**Cevap:** Kimlik doğrulama, oturum yönetimi, güvenlik middleware'ları ve Firestore kural setleri ile güvenlik sağlanır.

### 9. Projeyi ölçeklendirmek istersek ne yapmalıyız?
**Cevap:** Monorepo ve modüler yapı sayesinde yeni oyunlar kolayca eklenebilir. Firebase ve bulut altyapısı ile binlerce kullanıcıya hizmet verilebilir.

### 10. Kullanıcı deneyimini artırmak için neler yaptınız?
**Cevap:** Responsive ve modern arayüzler, animasyonlar, bildirimler, çoklu dil ve tema desteği ile kullanıcı deneyimi ön planda tutuldu.

---

## Ek Kaynaklar
- [README.md](README.md): Kurulum, kullanım ve genel proje bilgileri
- Firebase, MUI, React, Lerna, Docker, Jest, Cypress, Storybook resmi dökümantasyonları

---

Her türlü teknik detay ve mimari karar için bu dosyayı referans alabilirsiniz. Daha fazla bilgi için kodun başındaki Türkçe açıklamaları ve README.md'yi inceleyin.
