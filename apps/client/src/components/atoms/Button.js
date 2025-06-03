import React from 'react';
import { Button as MUIButton } from '@mui/material';
import { motion } from 'framer-motion';
import { colors } from '../../themes/designTokens';

/**
 * Atomic Button component.
 * Props:
 *  - variant: 'primary' | 'secondary'
 *  - children, ...props => passed to MUIButton
 */
const MotionButton = motion(MUIButton);
/* eslint-disable react/jsx-props-no-spreading */
function Button({ variant = 'primary', sx, ...props }) {
  const bg = variant === 'primary' ? colors.primary : colors.secondary;
  const hoverBg = variant === 'primary' ? '#1565c0' : '#b0003a';
  return (
    <MotionButton
      whileTap={{ scale: 0.95 }}
      {...props}
      sx={{
        textTransform: 'none',
        bgcolor: bg,
        color: '#fff',
        transition: 'background-color 0.3s',
        '&:hover': { bgcolor: hoverBg },
        ...sx,
      }}
    />
  );
}

export default Button; 