import { createTheme } from '@mui/material/styles';

const gameTheme = createTheme({
  palette: {
    primary: { main: '#388e3c' },
    secondary: { main: '#f57c00' },
    background: { default: '#121212', paper: '#1e1e1e' },
    mode: 'dark',
  },
});

export default gameTheme;