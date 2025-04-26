import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
// Note: use-sound might have issues with React 18 strict mode or specific bundlers.
// If issues arise, consider alternatives like Howler.js (already in dependencies) or Web Audio API directly.
import useSound from 'use-sound';

// --- Sound URLs using actual files from /public/sounds/ ---
const DRAW_SOUND_URL = '/sounds/mixkit-game-ball-tap-2073.wav';
const WIN_SOUND_URL = '/sounds/mixkit-winning-notification-2018.wav';
const CLICK_SOUND_URL = '/sounds/mixkit-modern-click-box-check-1120.wav';
// -----------------------------

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playDrawSound: () => void;
  playWinSound: () => void;
  playClickSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function useSoundEffects() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundEffects must be used within a SoundProvider');
  }
  return context;
}

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isMuted, setIsMuted] = useState(false);

  // When mute state changes, log it
  useEffect(() => {
    console.log('[SoundContext] Mute state changed:', isMuted);
  }, [isMuted]);

  const soundOptions = { soundEnabled: !isMuted };

  const [playDraw] = useSound(DRAW_SOUND_URL, soundOptions);
  const [playWin] = useSound(WIN_SOUND_URL, soundOptions);
  const [playClick] = useSound(CLICK_SOUND_URL, {...soundOptions, volume: 0.5 });

  const toggleMute = useCallback(() => {
    console.log('[SoundContext] Toggling mute...');
    setIsMuted((prev) => !prev);
  }, []);

  // Wrap play functions to add logging
  const playDrawSound = useCallback(() => {
    console.log('[SoundContext] Attempting to play Draw sound. Muted:', isMuted);
    if (!isMuted) (playDraw as () => void)();
  }, [playDraw, isMuted]);

  const playWinSound = useCallback(() => {
    console.log('[SoundContext] Attempting to play Win sound. Muted:', isMuted);
    if (!isMuted) (playWin as () => void)();
  }, [playWin, isMuted]);

  const playClickSound = useCallback(() => {
    console.log('[SoundContext] Attempting to play Click sound. Muted:', isMuted);
    if (!isMuted) (playClick as () => void)();
  }, [playClick, isMuted]);

  const contextValue: SoundContextType = {
    isMuted,
    toggleMute,
    // Use the wrapped functions
    playDrawSound,
    playWinSound,
    playClickSound,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
} 