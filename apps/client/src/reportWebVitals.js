/**
 * src/reportWebVitals.js: Uygulama performans metriklerini toplayıp raporlamak için yardımcı modül.
 * Web Vitals kütüphanesini dinamik olarak yükler ve performans değerlerini callback fonksiyonuna iletir.
 *
 * @param {function} onPerfEntry - Metrik veri alındığında çalışacak callback fonksiyonu.
 */
const reportWebVitals = onPerfEntry => {
  // onPerfEntry callback fonksiyonu, performans metrik verileri alındığında çağrılır
  // Bu fonksiyon ile ölçülen veriler işlenebilir veya dış sistemlere raporlanabilir
    if (onPerfEntry && onPerfEntry instanceof Function) {
      // Web Vitals modülü dinamik olarak import ediliyor
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // CLS: Cumulative Layout Shift – sayfa yerleşimindeki kaymaları ölçer
        getCLS(onPerfEntry);
        // FID: First Input Delay – ilk kullanıcı etkileşim gecikmesini ölçer
        getFID(onPerfEntry);
        // FCP: First Contentful Paint – ilk içerik öğesinin boyanma süresini ölçer
        getFCP(onPerfEntry);
        // LCP: Largest Contentful Paint – en büyük içerikli öğenin boyanma süresini ölçer
        getLCP(onPerfEntry);
        // TTFB: Time to First Byte – ilk byte'ın gelme süresini ölçer
        getTTFB(onPerfEntry);
      });
    }
  };
  
  export default reportWebVitals;