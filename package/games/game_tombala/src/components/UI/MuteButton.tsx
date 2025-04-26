import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useSoundEffects } from '../../contexts/SoundContext'; // Adjust path as needed
import { useTranslation } from 'react-i18next';

const MuteButton: React.FC = () => {
  const { isMuted, toggleMute } = useSoundEffects();
  const { t } = useTranslation();

  return (
    <Tooltip title={t(isMuted ? 'unmuteSounds' : 'muteSounds')}>
      <IconButton
        onClick={toggleMute}
        color="inherit"
        sx={{
          position: 'fixed', // Position globally
          bottom: 16,
          right: 16,
          zIndex: 1300, // Ensure it's above other elements (like Snackbar)
          bgcolor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default MuteButton; 