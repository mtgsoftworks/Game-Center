import React from 'react'; // React: JSX ve bileşen tanımları için
import { IconButton, Tooltip } from '@mui/material'; // IconButton, Tooltip: MUI buton ve ipucu bileşenleri
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Brightness4Icon: koyu tema ikonu
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Brightness7Icon: açık tema ikonu
import { useThemeMode } from '../../contexts/ThemeModeContext'; // useThemeMode: tema modu durumu ve toggle fonksiyonu sağlayan custom hook
import { useTranslation } from 'react-i18next'; // useTranslation: çoklu dil desteği için hook

// ThemeToggleButton: tema modunu değiştiren buton bileşeni
const ThemeToggleButton: React.FC = () => {
  // mode: 'light' veya 'dark', toggleThemeMode: mod değiştirme fonksiyonu
  const { mode, toggleThemeMode } = useThemeMode();
  // t: çeviri fonksiyonu
  const { t } = useTranslation();

  return (
    // Tooltip: buton üzerine gelince açıklama gösterir
    <Tooltip title={t(mode === 'dark' ? 'switchToLight' : 'switchToDark')}>
      <>
        {/* Tooltip title için çeviri anahtarları eklenmeli */}
        <IconButton
          // toggleThemeMode: tema modunu değiştirir
          onClick={toggleThemeMode}
          color="inherit"
          sx={{
            // Consistent styling with MuteButton
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          {/* Tema moduna göre ikon seçimi */}
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </>
    </Tooltip>
  );
};

export default ThemeToggleButton;