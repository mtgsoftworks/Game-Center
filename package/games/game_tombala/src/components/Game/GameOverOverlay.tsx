import React from 'react';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Overlay receives countdown seconds from GameScreen

interface GameOverOverlayProps {
  winnerName: string | null | undefined;
  isWinner: boolean;
  countdownSeconds: number;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ winnerName, isWinner, countdownSeconds }) => {
  const { t } = useTranslation();

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
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // Semi-transparent overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure it's above game elements but below UI buttons
        textAlign: 'center',
        flexDirection: 'column'
      }}
    >
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
        {/* Live countdown until redirect */}
        <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
          {`Redirecting in ${countdownSeconds}s...`}
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export default GameOverOverlay;