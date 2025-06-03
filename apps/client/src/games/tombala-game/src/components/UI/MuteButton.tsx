import React from 'react'; // React: JSX ve bileşen tanımları için gerekli
import { IconButton, Tooltip } from '@mui/material'; // IconButton, Tooltip: MUI buton ve ipucu bileşenleri
import VolumeUpIcon from '@mui/icons-material/VolumeUp'; // VolumeUpIcon: ses açık ikonu
import VolumeOffIcon from '@mui/icons-material/VolumeOff'; // VolumeOffIcon: sessiz ikonu
import { useSoundEffects } from '../../contexts/SoundContext'; // useSoundEffects: ses efektleri durumu ve toggle fonksiyonu sağlayan custom hook
import { useTranslation } from 'react-i18next'; // useTranslation: çeviri ve metin değiştirme için hook

// MuteButton: ses efektlerini açıp kapatan buton bileşeni
const MuteButton: React.FC = () => {
  // isMuted: sessiz mi, toggleMute: sessizlik durumunu değiştirme fonksiyonu
  const { isMuted, toggleMute } = useSoundEffects();
  // t: çeviri fonksiyonu
  const { t } = useTranslation();

  return (
    // Tooltip: buton üzerine gelince açıklama gösterir
    <Tooltip title={t(isMuted ? 'unmuteSounds' : 'muteSounds')}>
      <IconButton
        // toggleMute: sessiz/aktif durumu değiştirir
        onClick={toggleMute}
        color="inherit"
        sx={{
          position: 'fixed', // Sayfada sabit konumlandırma
          bottom: 16,
          right: 16,
          zIndex: 1300, // Üst katmanda görünür
          bgcolor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        {/* Sessie durumuna göre ikon seçimi */}
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default MuteButton; 