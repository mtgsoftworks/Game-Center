/**
 * src/components/Game/AudioControls.tsx: Oyun sırasında ses efektlerini ve müziği yönetmek için kontrolleri sunan bileşen.
 * Kullanıcı sesi açıp kapatabilir, ses seviyesini ayarlayabilir.
 *
 * @returns {JSX.Element} Ses kontrol arayüzü.
 */
import React, { useState } from 'react';
// React: JSX desteği, useState: bileşen durumu yönetmek için hook
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
// Volume* ikonları: ses durumuna göre gösterilecek ikonlar

interface AudioControlsProps {
  isMuted: boolean;
  onToggle: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ 
  isMuted, 
  onToggle,
  volume = 0.5,
  onVolumeChange
}) => {
  // showVolumeControl: ses kontrol kaydırıcısını göster/gizle durumu
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // handleVolumeClick: ses kontrolleri arayüzünü aç/kapa
  const handleVolumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeControl(!showVolumeControl);
  };

  // handleVolumeChange: kaydırıcı değeri değiştiğinde sesi güncelle
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  // getVolumeIcon: sessiz/mute ve ses seviyesine göre uygun ikon seçimi
  const getVolumeIcon = () => {
    if (isMuted) return <VolumeX className="w-6 h-6 text-gray-600" />;
    if (volume < 0.5) return <Volume1 className="w-6 h-6 text-indigo-600" />;
    return <Volume2 className="w-6 h-6 text-indigo-600" />;
  };

  return (
    // Ses kontrolleri butonu ve opsiyonel kaydırıcı arayüzü
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {showVolumeControl && (
        <div className="p-3 bg-white rounded-lg shadow-lg mb-2 transform transition-all duration-200">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-indigo-600"
          />
        </div>
      )}
      <button
        onClick={(e) => {
          // Tek tıklama: kaydırıcıyı aç/kapa; çift tıklama: sessiz/aç işlemi
          if (onVolumeChange) {
            handleVolumeClick(e);
          } else {
            onToggle();
          }
        }}
        onDoubleClick={onToggle}
        className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
        title={isMuted ? "Sessiz mod kaldır" : "Ses ayarla veya çift tıkla sessize al"}
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};

export default AudioControls;