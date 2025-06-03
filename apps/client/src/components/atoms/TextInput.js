import React from 'react';
import { TextField as MUITextField } from '@mui/material';
import { typography } from '../../themes/designTokens';

/**
 * Atomic TextInput component.
 * Props:
 *  - label: string
 *  - variant: 'outlined' | 'filled' | 'standard'
 *  - fullWidth: boolean (default true)
 *  - ...props => diğer MUITextField özellikleri
 */
const TextInput = ({ label, variant = 'outlined', fullWidth = true, sx, InputProps, InputLabelProps, ...props }) => {
  return (
    <MUITextField
      {...props}
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      sx={{
        mb: 2,
        ...sx,
      }}
      InputLabelProps={{
        style: {
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize.body2,
        },
        ...InputLabelProps,
      }}
      InputProps={{
        style: {
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize.body1,
        },
        ...InputProps,
      }}
    />
  );
};

export default TextInput; 