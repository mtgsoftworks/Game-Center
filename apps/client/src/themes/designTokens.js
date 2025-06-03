import { alpha } from '@mui/material/styles';

// "Oyun Merkezi Teması" Renkleri (prompt.md'ye göre)
const gameCenterColors = {
  primary: { main: '#3f51b5', light: alpha('#3f51b5', 0.8), dark: alpha('#3f51b5', 0.9) }, // light/dark prompt.md'de yok, MUI default veya alpha ile ayarlanabilir.
  secondary: { main: '#ff4081', light: alpha('#ff4081', 0.8), dark: alpha('#ff4081', 0.9) },
  error: { main: '#d32f2f' },
  warning: { main: '#ed6c02' },
  info: { main: '#0288d1' },
  success: { main: '#2e7d32' },
  background: { default: '#f5f5f5', paper: '#ffffff' },
  surface: '#ffffff',
  text: { primary: '#212121', secondary: '#757575', disabled: '#bdbdbd', hint: '#9e9e9e' },
};

// "Oyun Teması" Renkleri (Örnek olarak farklılaştırılmış)
const gameSpecificColors = {
  primary: { main: '#ff4081', light: alpha('#ff4081', 0.8), dark: alpha('#ff4081', 0.9) }, // secondary'yi primary yaptık
  secondary: { main: '#3f51b5', light: alpha('#3f51b5', 0.8), dark: alpha('#3f51b5', 0.9) }, // primary'yi secondary yaptık
  error: { main: '#e53935' }, // Biraz daha canlı bir kırmızı
  warning: { main: '#fdd835' }, // Sarımsı bir uyarı
  info: { main: '#1e88e5' }, // Biraz daha farklı bir mavi
  success: { main: '#43a047' }, // Biraz daha farklı bir yeşil
  background: { default: '#303030', paper: '#424242' }, // Koyu tema bazı
  surface: '#424242',
  text: { primary: '#ffffff', secondary: alpha('#ffffff', 0.7), disabled: alpha('#ffffff', 0.5), hint: alpha('#ffffff', 0.5) },
};

export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: '2.25rem', fontWeight: 500, lineHeight: 1.2 }, // 36px
  h2: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.25 },    // 32px
  h3: { fontSize: '1.75rem', fontWeight: 500, lineHeight: 1.3 },   // 28px
  h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.33 },  // 24px
  h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.35 },  // 20px
  h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4 }, // 18px
  subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }, // 16px
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 }, // 14px
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }, // 16px
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 }, // 14px
  button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 }, // 12px
  overline: { fontSize: '0.75rem', fontWeight: 400, textTransform: 'uppercase', lineHeight: 2.66 },
};

// Spacing birimi: MUI'nin default spacing unit'i (genellikle 8px, ama temada ayarlanabilir)
// export const spacing = 8; // MUI createTheme bunu kendi yönetir.

export const getThemeOptions = (mode = 'gameCenter') => ({
  palette: mode === 'gameCenter' ? gameCenterColors : gameSpecificColors,
  typography: typography,
  // Diğer tema özelleştirmeleri (shape, spacing, components overrides vb.) buraya eklenebilir.
  // Örnek bileşen özelleştirmesi:
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Hafif yuvarlak butonlar
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 8, // Kağıt elemanları için de yuvarlaklık
            }
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12, // Kartlar için biraz daha fazla yuvarlaklık
            }
        }
    }
  }
}); 