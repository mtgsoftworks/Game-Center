# Proje Mimarisi: Gerçek Zamanlı Bingo Oyunu

## 1. Giriş

Bu belge, React, TypeScript ve Firebase kullanılarak geliştirilen gerçek zamanlı çok oyunculu Bingo oyununun mimarisini açıklamaktadır. Amaç, kullanıcıların odalar oluşturup katılabildiği, diğer oyuncularla bingo oynayabildiği ve sohbet edebildiği bir web uygulaması sunmaktır.

## 2. Kullanılan Teknolojiler

*   **Frontend:**
    *   React (Vite ile)
    *   TypeScript
    *   Tailwind CSS (Stil için)
    *   `react-router-dom` (Sayfa yönlendirme için)
    *   `i18next` & `react-i18next` (Uluslararasılaştırma/Çoklu dil desteği için)
    *   `lucide-react` (İkonlar için)
*   **Backend & Veritabanı:**
    *   Firebase Realtime Database (Oyun durumu, oyuncu verileri ve sohbet mesajları için gerçek zamanlı veri senkronizasyonu)
    *   Firebase Authentication (E-posta/Şifre ve Facebook ile kullanıcı kimlik doğrulaması)
*   **Geliştirme Araçları:**
    *   Node.js & npm/yarn
    *   Git & GitHub/GitLab/Bitbucket

## 3. Temel Kavramlar

*   **Oyun Odası (Game Room):** Belirli sayıda oyuncunun katılabildiği, benzersiz bir ID'ye sahip sanal alan. Oyunun tüm durumu bu oda altında Firebase'de saklanır.
*   **Oyun Durumu (Game State):** Bir oyun odasının mevcut durumunu (`waiting`, `countdown`, `playing`, `finished`), çekilen sayıları, kazananı, oyuncuları vb. içeren merkezi veri yapısı. Firebase Realtime Database'de tutulur ve tüm istemcilere gerçek zamanlı olarak yansıtılır.
*   **Oyuncu (Player):** Oyuna katılan kullanıcı. Oyuncunun kimliği, adı, bingo kartı (`board`), işaretlediği sayılar (`marks`), hazır olup olmadığı (`ready`) ve rengi gibi bilgileri içerir.
*   **Gerçek Zamanlı Senkronizasyon:** Firebase Realtime Database, oyun durumu veya oyuncu verilerindeki herhangi bir değişikliği anında tüm bağlı istemcilere iletir. Frontend, bu değişiklikleri dinler ve arayüzü buna göre günceller.
*   **Ev Sahibi (Host):** Oyunu başlatan veya odadaki ilk oyuncu. Sayı çekme gibi bazı oyun yönetimi görevlerinden sorumludur.

## 4. Bileşen Yapısı (src/components)

*   **`Auth/`:** Kullanıcı kayıt (`SignUp`) ve giriş (`Login`) bileşenleri.
*   **`Lobby/`:** Oyun lobisi. Mevcut oyunları listeler, yeni oyun oluşturma ve katılma işlevlerini barındırır (`Lobby`, `CreateGame`, `JoinGame`).
*   **`Game/`:** Oyun odası arayüzü (`GameRoom`).
    *   `Board`: Bingo kartını gösterir ve işaretleme işlevini yönetir.
    *   `Countdown`: Oyun başlangıcı için geri sayım sayacını gösterir.
    *   Diğer alt bileşenler (oyuncu listesi, çekilen sayılar, sohbet vb.).
*   **`Shared/` veya Kök Dizin:** Dil değiştirici (`LanguageSwitcher`), Yükleniyor göstergesi gibi genel bileşenler.
*   **`App.tsx`:** Ana uygulama bileşeni. Yönlendirmeyi (Routing) ve genel layout'u yönetir.
*   **`main.tsx`:** Uygulamanın giriş noktası. React uygulamasını DOM'a render eder, Context Provider'ları (örn. `AuthContext`) ve `i18n` yapılandırmasını başlatır.

## 5. Veri Akışı

1.  **Kimlik Doğrulama:** Kullanıcı Firebase Auth ile giriş yapar/kayıt olur. `AuthContext` kullanıcı bilgilerini saklar.
2.  **Lobi:** Lobi bileşeni, Firebase'den 'waiting' durumundaki oyun odalarını listeler.
3.  **Oda Oluşturma/Katılma:** Kullanıcı bir oda oluşturduğunda veya katıldığında, Firebase Realtime Database'de ilgili oyun odası verisi oluşturulur veya güncellenir.
4.  **Oyun Odası:** `GameRoom` bileşeni, Firebase'deki kendi `roomId`'sine ait veriyi gerçek zamanlı olarak dinler (`onValue`).
5.  **Oyuncu Aksiyonları:**
    *   **Hazır Olma:** Oyuncu "Hazırım" butonuna tıkladığında, Firebase'deki kendi `ready` durumu güncellenir.
    *   **Sayı İşaretleme:** Oyuncu kartındaki bir sayıya tıkladığında (`handleNumberMark`), sayı kontrol edilir (çekilmiş mi?). Eğer geçerliyse, Firebase'deki oyuncunun `marks` dizisi güncellenir. Başarılı güncelleme sonrası kazanma durumu kontrol edilir (`checkWin`).
    *   **Mesaj Gönderme:** Mesaj gönderildiğinde, Firebase'deki odanın `messages` listesine eklenir.
6.  **Oyun Mantığı (Host Tarafı):**
    *   **Sayı Çekme:** Oyun `playing` durumundayken, ev sahibi istemci (`hostId`'si eşleşen) belirli aralıklarla (`DRAW_INTERVAL`) yeni bir sayı çeker (`drawNextNumber`) ve Firebase'deki `drawnNumbers` ve `currentNumber` güncellenir.
7.  **Durum Güncellemeleri:** Firebase'deki herhangi bir değişiklik (yeni sayı, oyuncu katılması/ayrılması, mesaj, durum değişikliği), `onValue` dinleyicisi aracılığıyla tüm istemcilerin `gameState`'ini tetikler ve React arayüzü otomatik olarak güncellenir.
8.  **Kazanma Tespiti:** Bir oyuncu bir sayıyı işaretledikten sonra (`handleNumberMark` içinde, Firebase güncellemesi başarılı olursa), `checkWin` fonksiyonu ile kazanma durumu kontrol edilir. Kazanan varsa `determineWinner` çağrılır ve oyun durumu Firebase'de `finished` olarak güncellenir.

## 6. Firebase Realtime Database Yapısı (Örnek)

```json
{
  "games": {
    "roomId1": {
      "status": "playing", // waiting, countdown, playing, finished
      "currentNumber": 42,
      "drawnNumbers": [10, 25, 42],
      "winner": null, // playerId or "tie"
      "hostId": "user1",
      "roomCode": "ABCD",
      "lastDrawTime": 1678886400000,
      "countdownStartTime": 1678886397000,
      "players": {
        "user1": {
          "id": "user1",
          "name": "Alice",
          "board": [[...],[...], ...],
          "marks": [[...],[...], ...],
          "ready": true,
          "color": "#4F46E5"
        },
        "user2": {
          "id": "user2",
          "name": "Bob",
          "board": [[...],[...], ...],
          "marks": [[...],[...], ...],
          "ready": true,
          "color": "#EF4444"
        }
      },
      "messages": {
        "msg1": {
          "id": "msg1",
          "userId": "user1",
          "userName": "Alice",
          "text": "Merhaba!",
          "timestamp": 1678886410000
        }
      }
    },
    "roomId2": { ... }
  }
}
```

## 7. Klasör Yapısı

```
/
├── public/
│   └── locales/         # Dil dosyaları (örn. en/translation.json)
├── src/
│   ├── assets/          # Resimler, fontlar vb.
│   ├── components/      # React bileşenleri (Auth, Game, Lobby, Shared)
│   ├── config/          # Firebase yapılandırması (firebase.ts)
│   ├── contexts/        # React Context'leri (AuthContext.tsx)
│   ├── hooks/           # Özel hook'lar (varsa)
│   ├── services/        # API çağrıları veya diğer servisler (varsa)
│   ├── styles/          # Global CSS veya stil dosyaları (varsa)
│   ├── App.tsx          # Ana uygulama bileşeni ve yönlendirme
│   ├── main.tsx         # Uygulama giriş noktası
│   ├── i18n.ts          # i18next yapılandırması
│   └── vite-env.d.ts    # Vite ortam değişken tipleri
├── .env                 # Ortam değişkenleri (Firebase API key vb.)
├── .eslintrc.cjs        # ESLint yapılandırması
├── .gitignore           # Git tarafından izlenmeyecek dosyalar
├── ARCHITECTURE.md      # Bu dosya
├── database.rules.json  # Firebase Realtime Database güvenlik kuralları
├── firebase.json        # Firebase CLI yapılandırması (hosting vb.)
├── index.html           # Ana HTML dosyası
├── package.json         # Proje bağımlılıkları ve script'leri
├── postcss.config.js    # PostCSS yapılandırması
├── README.md            # Proje hakkında genel bilgi
├── tailwind.config.js   # Tailwind CSS yapılandırması
└── tsconfig.json        # TypeScript yapılandırması
└── tsconfig.node.json
```

## 8. Gelecekteki İyileştirmeler (Potansiyel)

*   **Cloud Functions:** Kritik oyun mantığını (örn. sayı çekme, kazanma kontrolü) sunucu tarafına taşımak için Firebase Cloud Functions kullanmak. Bu, hileyi önler ve istemci tarafındaki yükü azaltır.
*   **Daha Gelişmiş Durum Yönetimi:** Büyük uygulamalarda Zustand veya Redux Toolkit gibi durum yönetimi kütüphaneleri düşünülebilir.
*   **Testler:** Birim (Unit) ve entegrasyon (Integration) testleri eklemek.
*   **Optimizasyon:** Büyük oyun odaları veya çok sayıda eşzamanlı kullanıcı için Firebase sorgularını ve React bileşenlerini optimize etmek. 

## 9. README.md Dosyası

README.md dosyası proje hakkında genel bakış, temel özellikler, teknoloji yığını, kurulum ve kullanım talimatlarını içerir. Bu dosya, kullanıcıların projeyi klonlaması, bağımlılıkları yüklemesi ve geliştirme sunucusunu başlatması için adım adım rehberlik eder.