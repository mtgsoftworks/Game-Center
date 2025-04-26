import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon
import { useThemeMode } from '../../contexts/ThemeModeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggleButton: React.FC = () => {
  const { mode, toggleThemeMode } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Tooltip title={t(mode === 'dark' ? 'switchToLight' : 'switchToDark')}>
      <>
        {/* Add keys to translation files */}
        <IconButton
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
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </>
    </Tooltip>
  );
};

export default ThemeToggleButton;