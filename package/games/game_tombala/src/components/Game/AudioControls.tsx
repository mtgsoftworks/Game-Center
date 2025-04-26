import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

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
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  const handleVolumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVolumeControl(!showVolumeControl);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted) return <VolumeX className="w-6 h-6 text-gray-600" />;
    if (volume < 0.5) return <Volume1 className="w-6 h-6 text-indigo-600" />;
    return <Volume2 className="w-6 h-6 text-indigo-600" />;
  };

  return (
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
          if (onVolumeChange) {
            handleVolumeClick(e);
          } else {
            onToggle();
          }
        }}
        onDoubleClick={onToggle}
        className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
        title={isMuted ? "Unmute" : "Adjust volume or double-click to mute"}
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};

export default AudioControls;