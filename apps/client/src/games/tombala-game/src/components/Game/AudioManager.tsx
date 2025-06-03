/**
 * src/components/Game/AudioManager.tsx: Oyun içi ses efektleri ve müziklerin yönetimini sağlayan bileşen.
 * Ses dosyalarını yükler, oynatır ve durdurur. Kullanıcı tercihlerine göre sesi kontrol eder.
 *
 * @returns {JSX.Element | null} Ses yönetimi için yardımcı bileşen.
 */
// React: JSX desteği, useEffect: yan etkileri yönetmek için Hook
import React, { useEffect } from 'react';
// AudioControls: ses kontrol butonlarını gösteren bileşen
import AudioControls from './AudioControls';
// useAudio: ses durumunu ve efektleri yöneten özel Hook
import { useAudio } from '../../hooks/useAudio';
// useLocation: mevcut rota bilgisini almak için Hook
import { useLocation } from 'react-router-dom';

/**
 * AudioManager: uygulama genelinde arkaplan müziği ve ses efektlerini yönetir
 */
const AudioManager: React.FC = () => {
  // useAudio’dan gelen sessizlik, ses seviyesi ve efekt fonksiyonları
  const { 
    isMuted, 
    toggleMute, 
    volume, 
    adjustVolume, 
    playBackgroundMusic, 
    playButtonClick 
  } = useAudio();
  // sayfa konumunu izlemek için kullanılır (buton sesi tetiklemek için)
  const location = useLocation();

  // Bileşen yüklendiğinde arkaplan müziğini başlatır
  useEffect(() => {
    playBackgroundMusic();
  }, [playBackgroundMusic]);

  // Rota değiştirildiğinde buton tıklama sesini çalar
  useEffect(() => {
    playButtonClick();
  }, [location.pathname, playButtonClick]);

  // Ses kontrollerini sunan AudioControls bileşenini render eder
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