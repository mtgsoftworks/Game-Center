import React, { useEffect } from 'react';
import AudioControls from './AudioControls';
import { useAudio } from '../../hooks/useAudio';
import { useLocation } from 'react-router-dom';

const AudioManager: React.FC = () => {
  const { 
    isMuted, 
    toggleMute, 
    volume, 
    adjustVolume, 
    playBackgroundMusic, 
    playButtonClick 
  } = useAudio();
  const location = useLocation();

  // Start background music when the component mounts
  useEffect(() => {
    playBackgroundMusic();
  }, [playBackgroundMusic]);

  // Play button click sound on route changes
  useEffect(() => {
    playButtonClick();
  }, [location.pathname, playButtonClick]);

  return (
    <AudioControls 
      isMuted={isMuted} 
      onToggle={toggleMute} 
      volume={volume}
      onVolumeChange={adjustVolume}
    />
  );
};

export default AudioManager; 