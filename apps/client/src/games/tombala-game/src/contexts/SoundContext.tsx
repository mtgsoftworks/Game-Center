/**
 * src/contexts/SoundContext.tsx: Uygulama ses efektlerini yöneten Context modülü.
 * useSound kancası ile çekiliş, kazanma ve tıklama seslerini oynatır.
 * Mute durumu toggleMute fonksiyonu ile yönetilir.
 *
 * Dışa Aktarılanlar:
 *  - useSoundEffects(): Ses efektleri fonksiyonlarına erişim sağlayan hook.
 *  - SoundProvider({ children }): Ses efektleri ve mute durumunu sağlayan provider bileşeni.
 *
 * @returns {JSX.Element} Sound context provider bileşeni.
 */
// React hook'ları: Context, state, efekt ve callback için gerekli
import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
// use-sound: ses efektlerini oynatmak için hook
import useSound from 'use-sound';

// SOUND_URL sabitleri: public klasöründeki ses dosyalarının yolları
const DRAW_SOUND_URL = '/sounds/mixkit-game-ball-tap-2073.wav';
const WIN_SOUND_URL = '/sounds/mixkit-winning-notification-2018.wav';
const CLICK_SOUND_URL = '/sounds/mixkit-modern-click-box-check-1120.wav';

// SoundContextType: mute durumu ve ses oynatma fonksiyonları
interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playDrawSound: () => void;
  playWinSound: () => void;
  playClickSound: () => void;
}

// SoundContext: ses efektleri durumunu paylaşan React Context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// useSoundEffects: SoundContext'i tüketen hook, must be used inside SoundProvider
export function useSoundEffects() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundEffects must be used within a SoundProvider');
  }
  return context;
}

// SoundProvider: uygulama genelinde ses efektlerini ve mute durumunu yönetir
interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  // isMuted: ses kapalı mı? estado
  const [isMuted, setIsMuted] = useState(false);

  // useEffect: mute durumu değiştiğinde konsola log atar
  useEffect(() => {
    console.log('[SoundContext] Mute state changed:', isMuted);
  }, [isMuted]);

  // soundOptions: ses oynatma ayarları, mute'a göre kontrol
  const soundOptions = { soundEnabled: !isMuted };

  // useSound hook'ları: her ses için oynatma fonksiyonu
  const [playDraw] = useSound(DRAW_SOUND_URL, soundOptions);
  const [playWin] = useSound(WIN_SOUND_URL, soundOptions);
  const [playClick] = useSound(CLICK_SOUND_URL, { ...soundOptions, volume: 0.5 });

  // toggleMute: mute durumunu tersine çevirir
  const toggleMute = useCallback(() => {
    console.log('[SoundContext] Toggling mute...');
    setIsMuted((prev) => !prev);
  }, []);

  // playXSound: ses oynatma fonksiyonlarını sarmalayarak mute kontrolü sağlar
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

  // contextValue: SoundContext tüketicilerine sunulur
  const contextValue: SoundContextType = {
    isMuted,
    toggleMute,
    playDrawSound,
    playWinSound,
    playClickSound,
  };

  // SoundContext.Provider: alt bileşenlere ses fonksiyonlarını sunar
  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
}