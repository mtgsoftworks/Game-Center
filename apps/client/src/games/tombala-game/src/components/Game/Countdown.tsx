/**
 * src/components/Game/Countdown.tsx: Oyun başlangıcı veya tur arası için geri sayım sayacı bileşeni.
 * Geri sayım tamamlandığında ilgili işlemi tetikler.
 *
 * @param {object} props - Geri sayım süresi ve tamamlanınca çağrılacak fonksiyon.
 * @returns {JSX.Element} Geri sayım arayüzü.
 */
// React: JSX desteği için gerekli
import React from 'react';
// motion, AnimatePresence: animasyonlu geri sayım için Framer Motion bileşenleri
import { motion, AnimatePresence } from 'framer-motion';

// CountdownProps: geri sayım sayısını prop olarak alır
interface CountdownProps {
  count: number;
}

// Countdown: animasyonlu sayacı gösteren bileşen
const Countdown: React.FC<CountdownProps> = ({ count }) => {
  return (
    // AnimatePresence: element çıkış animasyonunu düzgün yönetir
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          // key değiştiğinde animasyon tetiklenir
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-bold text-white"
        >
          {count}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Countdown;