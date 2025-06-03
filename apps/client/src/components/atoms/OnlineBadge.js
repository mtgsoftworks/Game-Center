import React from 'react';
import { Badge, styled } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700', // Yeşil renk online için
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

// Bu bileşen doğrudan bir Avatar'ı sarmalamak yerine,
// Avatar'ın yanında veya üzerinde konumlandırılacak küçük bir nokta olarak düşünülebilir.
// Veya secondaryAction içinde direkt bir ikon gibi de kullanılabilir.
// Şimdilik sadece Badge'in kendisini döndürelim, RightSidebar içinde nasıl kullanılacağına bakarız.

// Basit bir yeşil nokta gösterimi için:
const OnlineIndicator = () => (
    <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
    />
);

// Eğer bir Avatar'ı sarmalaması gerekiyorsa:
/*
function OnlineBadge({ children }) {
  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
    >
      {children} 
    </StyledBadge>
  );
}
*/

// RightSidebar'daki kullanım şekline göre (secondaryAction içinde)
// direkt Badge'i veya stilize edilmiş bir ikonu kullanmak daha uygun olabilir.
// Şimdilik, doğrudan kullanılabilecek bir indicator döndürelim.

export default OnlineIndicator; // Veya OnlineBadge eğer children alacaksa 