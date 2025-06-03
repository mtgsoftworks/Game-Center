/**
 * src/components/Game/GameOverOverlay.tsx: Oyun bittiğinde ekrana gelen sonuç ve bildirim arayüzü bileşeni.
 * Kazananı, kaybedeni ve oyun sonu seçeneklerini gösterir.
 *
 * @param {object} props - Oyun sonucu, kazanan ve kullanıcıya özel mesajlar.
 * @returns {JSX.Element} Oyun sonu arayüzü.
 */

import React from 'react'; // React: JSX desteği için
import { Typography } from '@mui/material'; // Typography: metin göstermek için UI bileşeni
import { motion } from 'framer-motion'; // motion: animasyonlu elementler için
import { useTranslation } from 'react-i18next'; // useTranslation: çoklu dil desteği için Hook

// GameOverOverlayProps: oyun sonucu, kazanan ve geri sayım süresi için prop tipleri
interface GameOverOverlayProps {
  winnerName: string | null | undefined;
  isWinner: boolean;
  countdownSeconds: number;
};

// GameOverOverlay: oyun sonu ekranında kazanan bilgisi ve yönlendirme sayacını gösterir
const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ winnerName, isWinner, countdownSeconds }) => {
  const { t } = useTranslation(); // t: çeviri fonksiyonu

  // Overlay konteyneri: tam ekran, yarı şeffaf zemin ve ortalanmış içerik
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Yarı saydam zemin
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // UI elemanlarının üstünde
        textAlign: 'center',
        flexDirection: 'column'
      }}
    >
      {/* Sonuç mesajı animasyonlu konteyner */}
      <motion.div
        initial={{ scale: 0.5, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      >
        <Typography variant="h2" component="div" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          {isWinner ? t('youWon') : t('youLost')}
        </Typography>
        <Typography variant="h5" sx={{ color: 'lightgrey', mb: 4 }}>
          {t('winnerIs')}: {winnerName || 'N/A'}
        </Typography>
        {/* Yönlendirme sayacı */}
        <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
          {`${t('redirecting')} ${countdownSeconds}s...`}
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export default GameOverOverlay;