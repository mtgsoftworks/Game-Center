# 2048 Oyunu 🎮

2048, 4×4 boyutunda bir tahta üzerinde aynı değere sahip blokları birleştirerek 2048 sayısına ulaşmayı hedeflediğiniz tek oyunculu kaydırmalı bulmaca oyunudur. React ve Sass kullanılarak geliştirilmiştir.

## Özellikler

- Klavye ok tuşları ve dokunmatik kaydırma desteği
- CSS geçişleriyle akıcı blok animasyonları
- Masaüstü ve mobil uyumlu responsive tasarım
- Anlık skor ve en yüksek skor takibi
- Skorların `localStorage`’da saklanması ve yüklenmesi

## Kurulum ve Başlangıç

### Gereksinimler

- Node.js (>=14.x)
- npm veya yarn

### Kurulum

```bash
git clone https://github.com/mtgsoftworks/Game-Center.git
cd Game-Center/package/games/game_2048
npm install
npm start  # Geliştirme sunucusunu çalıştırır
```

Tarayıcınızda `http://localhost:3000` adresini açın.

## Kullanılabilir Komutlar

- `npm start`: Geliştirme modunda başlatır
- `npm run build`: Üretim için derleme yapar (dist klasörü)
- `npm test`: Test sürücüsünü interaktif modda çalıştırır
- `npm run deploy`: GitHub Pages’a dağıtım yapar

## Oyun Kuralları

1. Tahtada 4×4 blok bulunur; her blokta sayı değeri (genellikle 2 veya 4) gösterilir.
2. Ok tuşları veya dokunmatik kaydırma ile tüm blokları seçilen yönde kaydırırsınız.
3. Aynı değerdeki iki blok çarpıştığında birleşir ve değerleri toplanır (örn. 2+2=4).
4. Her hamleden sonra boş bir hücreye rastgele 2 veya 4 değeri eklenir.
5. Birleşebilecek blok kalmadığında oyun sona erer.
6. 2048 sayısına ulaşırsanız oyunu kazanırsınız; rekabetçi oynamak için en yüksek skorunuzu zorlayın.

## Proje Yapısı

```
game_2048/
├── public/            # Statik varlıklar (HTML, görüntüler)
├── src/               # Kaynak kod
│   ├── components/    # React bileşenleri (Board, Tile, Score, Controls)
│   ├── styles/        # Sass/SCSS dosyaları
│   ├── App.jsx        # Ana uygulama bileşeni ve yönlendirme
│   └── index.jsx      # Uygulama giriş noktası
├── package.json       # Bağımlılıklar ve script'ler
└── README.md          # Bu dosya
```

## Teknoloji Yığını

- **Frontend:** React, Sass (SCSS)
- **Yapılandırma:** Babel, Webpack
- **Depolama:** Browser `localStorage`
- **Versiyon Kontrolü:** Git & GitHub

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır.
