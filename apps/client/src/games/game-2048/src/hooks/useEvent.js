/**
 * useEvent Hook'u
 * Belirtilen olaya (örn: 'keydown') dinleyici ekler ve bileşen kaldırıldığında temizler.
 * @param {string} event - Dinlenecek olay tipi (örn: 'keydown').
 * @param {function} handler - Olay tetiklendiğinde çağrılacak fonksiyon.
 * @param {boolean} passive - Pasif listener kullanılsın mı?
 */
import { useEffect } from 'react';

export default function useEvent(event, handler, passive = false) {
  useEffect(() => {
    // Olay dinleyici ekleniyor: belirtilen event ve handler ilişkilendiriliyor
    window.addEventListener(event, handler, passive);

    // Cleanup: component unmount veya bağımlılıklar değiştiğinde listener kaldırılıyor
    return () => window.removeEventListener(event, handler, passive);
  }, [event, handler, passive]);
}