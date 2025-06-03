# Proje Mimarisi: Gerçek Zamanlı Çok Oyunculu Tombala Oyunu

## 1. Giriş
Bu belge, **React**, **TypeScript** ve **Firebase** kullanarak geliştirilmiş gerçek zamanlı çok oyunculu Tombala (Bingo) oyununun tüm mimari detaylarını ele alır. Amaç; kullanıcıların benzersiz oda kodu ile lobi oluşturarak veya katılarak 5×5 tombala kartları üzerinde satır veya tam kart (full house) tamamlamalarını sağlamaktır.

## 2. Teknoloji Yığını
- **Frontend**
  - React (Vite)
  - TypeScript
  - MUI & Tailwind CSS (UI)
  - framer-motion (animasyon)
  - react-router-dom (yönlendirme)
  - i18next & react-i18next (çoklu dil desteği)
  - Howler (ses efektleri), react-hot-toast (bildirimler)
- **Backend & Gerçek Zamanlı Veri**
  - Firebase Realtime Database
  - Firebase Authentication (E-posta/Şifre, Facebook)
- **Geliştirme Araçları**
  - Node.js & npm/yarn
  - ESLint, Prettier
  - Jest (birim testleri), Cypress (E2E testleri)
  - Git & CI/CD (GitHub Actions)

## 3. Mimari Katmanlar
1. **İstemci (Client) Katmanı**  
   React bileşenleri, Context API, i18n, stil kütüphaneleri.
2. **Servis (Service) Katmanı**  
   `authService`, `lobbyService`, `gameService` gibi modüller; HTTP yerine Firebase SDK'sı.
3. **Veri (Data) Katmanı**  
   Firebase Realtime Database'de oyun odası (`rooms/{roomId}`), kullanıcılar (`users`), sohbet mesajları (`messages`), çekilen sayılar (`drawnNumbers`) saklanır.

## 4. Temel Bileşenler
- **Auth/**  
  Kullanıcı kaydı, giriş ve oturum kontrolü (`SignUp`, `Login`, `useAuth` hook).
- **Lobby/**  
  `LobbyList` (aktif lobiler), `CreateLobby`, `JoinLobby` bileşenleri.
- **GameRoom/**  
  - **Board**: Kart çizimi ve işaretleme mantığı.  
  - **Cell**: Her hücre. Tıklanabilir işaret fonksiyonu.  
  - **Controls**: "Hazırım" butonu, host yönetimi, zamanlayıcı.  
  - **DrawnNumbers**: Çekilen sayıların güncel listesi.  
  - **PlayerList**: Oyuncu durumu ve sıra bilgisi.  
  - **ChatBox**: Gerçek zamanlı sohbet.
- **Shared/**  
  Navbar, Footer, ThemeToggle, LanguageSwitcher gibi genel bileşenler.

## 5. Veri Akışı ve Oyun Mantığı
1. **Kimlik Doğrulama**  
   `authService.getCurrentUser` ile kullanıcı kontrol edilir, `AppContext`'e kaydedilir.
2. **Lobi Yönetimi**  
   `lobbyService.getLobbies` ile lobiler listelenir. Oda oluşturma/katılma `rooms/{roomId}` yolunda yeni veri oluşturur/günceller.
3. **Gerçek Zamanlı Dinleme**  
   `GameRoom` bileşeninde `onValue` dinleyicisi ilgili `roomId` verilerini izler.
4. **Oyun Döngüsü (Host)**  
   Host, belirlenen aralıklarla (`DRAW_INTERVAL`) `gameService.drawNumber` ile yeni sayı çeker. Bu sayı Firebase'de `drawnNumbers` ve `currentNumber` alanlarına eklenir.
5. **Hücre İşaretleme & Kazanma Kontrolü**  
   - `handleCellClick` ile hücre tıklanır; Firebase'de `marks` güncellenir.  
   - `gameService.checkWin` fonksiyonu satır veya full house kontrolü yapar; kazanan varsa `winner` alanına yazılır.
6. **Sohbet ve Bildirimler**  
   - `messages` düğümüne eklenen yeni mesajlar tüm oyunculara anında iletilir.  
   - react-hot-toast ile arayüzde toast bildirimleri gösterilir.

## 6. Lobi Yaşam Döngüsü
1. **Oluşturma**: Kullanıcı `CreateLobby` ile yeni bir lobi oluşturur. Firestore dokümanı `gameRooms/{roomId}` içinde:
   - `creatorUid`, `creatorName`, `roomName`, `maxPlayers`, `type` (`normal` | `event`), `password` (opsiyonel)
   - `startTime` ve `endTime` (etkinlik odaları için), `creatorLeftAt` (henüz katılmadıysa `null`), `status: 'waiting'`
2. **Çıkış (Leave Lobby)**: Kurucu `LeaveLobby` düğmesine basınca `creatorLeftAt = serverTimestamp()` set edilir.
3. **Zamanlanmış Kapanış (Cloud Function)**:
   - `closeExpiredRooms` fonksiyonu her saat çalışır.
   - `normal` lobilerde `creatorLeftAt ≤ now - 8h` ise `status = 'closed'` olarak güncellenir.
   - `event` lobilerde `endTime ≤ now` ise `status = 'closed'` olur.
4. **Otomatik Filtre & Sıralama (Client)**:
   - `useWaitingRooms` hook'u yalnızca `status == 'waiting'` olan lobeleri çeker.
   - `displayRooms` listesi:
     - Süresi geçen normal lobiler (`creatorLeftAt` + 8h) ve bitmiş event lobiler (`endTime`) filtrelenir.
     - Event lobiler (`startTime` artan), normal lobiler (`createdAt` azalan) olarak sıralanır.

## 7. Firebase Realtime Database Yapısı (Örnek)
```json
{
  "rooms": {
    "{roomId}": {
      "hostId": "user123",
      "roomCode": "ABCD",
      "status": "playing", // waiting, playing, finished
      "currentNumber": 17,
      "drawnNumbers": [5,9,17],
      "winner": null,
      "players": {
        "user123": { "name":"Ali","marks":[[false,...],...],"ready":true,"color":"#4CAF50" }
      },
      "messages": {
        "msg1": {"userId":"user456","text":"Merhaba!","timestamp":1680000000000}
      }
    }
  }
}
```

## 8. Proje Dizini
```
game_tombala/
├── public/          # Statik varlıklar ve i18n JSON'ları
├── src/
│   ├── assets/      # Resimler, fontlar
│   ├── components/  # UI bileşenleri
│   ├── contexts/    # AppContext
│   ├── services/    # authService, lobbyService, gameService
│   ├── i18n/        # Çeviri dosyaları ve yapılandırma
│   ├── App.tsx      # Ana uygulama bileşeni ve yönlendirme
│   └── main.tsx     # Uygulama giriş noktası
├── .env.example     # Ortam değişkenleri şablonu
├── package.json     # Bağımlılıklar ve script'ler
└── README.md        # Proje tanıtımı
```

## 9. Gelecekteki İyileştirmeler
- Oyun mantığını Firebase Cloud Functions'a taşıyarak hile riskini azaltma.  
- Birim ve E2E test kapsamını artırma (Jest, Cypress).  
- UI/UX ve erişilebilirlik (a11y) geliştirmeleri.  
- CI/CD entegrasyonu (GitHub Actions).