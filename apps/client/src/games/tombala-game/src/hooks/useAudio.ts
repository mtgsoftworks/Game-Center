/**
 * src/hooks/useAudio.ts: Oyun içi ses efektleri ve müziklerin yönetimini sağlayan özel React hook'u.
 * Howler.js ile ses dosyalarını yükler, oynatır, durdurur ve kullanıcı tercihlerine göre sesi kontrol eder.
 * Ses seviyesi ve sessizlik durumu localStorage'da saklanır.
 *
 * @returns {object} Ses dosyalarına erişim, ses kontrolleri ve ayar fonksiyonları.
 */

import { useEffect, useState } from 'react';
import { Howl } from 'howler';

interface AudioFiles {
  backgroundMusic: Howl;
  numberDrawn: Howl;
  buttonClick: Howl;
  win: Howl;
  countdown: Howl;
}

const DEFAULT_VOLUME = 0.5;

const createAudioFiles = (): AudioFiles => ({
  backgroundMusic: new Howl({
    src: ['/sounds/mixkit-game-show-suspense-waiting-667.wav'],
    loop: true,
    volume: 0.3,
  }),
  numberDrawn: new Howl({
    src: ['/sounds/mixkit-correct-answer-tone-2870.wav'],
    volume: DEFAULT_VOLUME,
  }),
  buttonClick: new Howl({
    src: ['/sounds/mixkit-modern-click-box-check-1120.wav'],
    volume: DEFAULT_VOLUME,
  }),
  win: new Howl({
    src: ['/sounds/mixkit-winning-notification-2018.wav'],
    volume: DEFAULT_VOLUME,
  }),
  countdown: new Howl({
    src: ['/sounds/mixkit-game-ball-tap-2073.wav'],
    volume: DEFAULT_VOLUME,
  }),
});

export const useAudio = () => {
  const [audio] = useState<AudioFiles>(createAudioFiles());
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('tombola-muted');
    return saved ? JSON.parse(saved) : false;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('tombola-volume');
    return saved ? JSON.parse(saved) : DEFAULT_VOLUME;
  });

  useEffect(() => {
    localStorage.setItem('tombola-muted', JSON.stringify(isMuted));
    
    Object.values(audio).forEach(sound => {
      sound.mute(isMuted);
    });
  }, [isMuted, audio]);

  useEffect(() => {
    localStorage.setItem('tombola-volume', JSON.stringify(volume));
    
    Object.entries(audio).forEach(([key, sound]) => {
      // Background music has its own volume setting
      if (key !== 'backgroundMusic') {
        sound.volume(volume);
      }
    });
  }, [volume, audio]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const adjustVolume = (newVolume: number) => {
    if (newVolume >= 0 && newVolume <= 1) {
      setVolume(newVolume);
    }
  };

  const playSound = (soundName: keyof AudioFiles) => {
    if (!isMuted) {
      audio[soundName].play();
    }
  };

  const stopSound = (soundName: keyof AudioFiles) => {
    audio[soundName].stop();
  };

  // Game-specific sound functions
  const playBackgroundMusic = () => {
    if (!isMuted && !audio.backgroundMusic.playing()) {
      audio.backgroundMusic.play();
    }
  };

  const playNumberDrawn = () => {
    if (!isMuted) {
      audio.numberDrawn.play();
    }
  };

  const playWinSound = () => {
    if (!isMuted) {
      audio.win.play();
    }
  };

  const playCountdownSound = () => {
    if (!isMuted) {
      audio.countdown.play();
    }
  };

  const playButtonClick = () => {
    if (!isMuted) {
      audio.buttonClick.play();
    }
  };

  return {
    playSound,
    stopSound,
    toggleMute,
    isMuted,
    volume,
    adjustVolume,
    playBackgroundMusic,
    playNumberDrawn,
    playWinSound,
    playCountdownSound,
    playButtonClick
  };
};