# Proje Mimarisi: 2048 Oyunu

Bu doküman, React ve Sass ile geliştirilmiş 2048 oyununun mimarisini ve bileşen yapısını detaylandırır.

## 1. Genel Mimari

- **SPA (Tek Sayfa Uygulaması)**: React kullanılarak oluşturulmuştur.
- **Durum Yönetimi**: `useState` ve `useEffect` hook’larıyla bileşen tabanlı.
- **Stil**: Sass (SCSS) modüler yapısında.

## 2. Ana Bileşenler

- **Board**: 4×4 ızgarayı oluşturur ve blokları konumlandırır.
- **Tile**: Her bir blok için değer, konum ve animasyonları yönetir.
- **Score**: Anlık ve en yüksek skoru gösterir.
- **Controls**: Klavye ve dokunmatik olaylarını dinleyerek hamleleri tetikler.

## 3. Durum Yönetimi ve Veri Akışı

1. Kullanıcı ok tuşu veya kaydırma hareketi yapar.
2. `handleMove` fonksiyonu çalışır, `mergeTiles` ile bloklar birleştirilir.
3. `score` güncellenir ve `localStorage`’a kaydedilir.
4. `addRandomTile` fonksiyonu rastgele yeni bir blok ekler.
5. Bileşenler yeniden render edilir ve animasyonlar devreye girer.

## 4. Stil ve Animasyon

- **Sass** ile tematik SCSS dosyaları.
- CSS Grid ve Flexbox düzeni.
- Animasyonlar CSS transition veya **framer-motion** kullanılarak.

## 5. Yapı ve Dağıtım

- Geliştirme: `npm start` (live reload)
- Üretim: `npm run build` (optimize output)

## 6. Gelecekteki İyileştirmeler

- WebAssembly ile performans optimizasyonu.
- Light/Dark tema desteği.
- Skorlar için sunucu tarafı veri tabanı entegrasyonu.
