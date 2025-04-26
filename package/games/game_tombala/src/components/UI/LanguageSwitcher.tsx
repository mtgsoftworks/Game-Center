import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <Box sx={{ minWidth: 80, mr: 1 }}>
      <FormControl fullWidth size="small">
        <Select
          value={i18n.language.split('-')[0]} // Get base language (e.g., 'en' from 'en-US')
          onChange={handleLanguageChange}
          variant="outlined"
          sx={{ color: 'inherit', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root': { color: 'white' } }}
        >
          <MenuItem value="en">EN</MenuItem>
          <MenuItem value="tr">TR</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher; 