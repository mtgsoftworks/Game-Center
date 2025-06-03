import { useEffect } from 'react';

/**
 * useInfiniteScroll
 * @param {React.RefObject} ref - son elemanı gözlemlemek için ref
 * @param {Function} callback - daha fazla veri yükleme fonksiyonu
 * @param {Object} options - IntersectionObserver opsiyonları (root, rootMargin, threshold)
 */
const useInfiniteScroll = (ref, callback, options = {}) => {
  useEffect(() => {
    let observer;
    if (ref.current) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          callback();
        }
      }, options);
      observer.observe(ref.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [ref, callback, JSON.stringify(options)]);
};

export default useInfiniteScroll; 