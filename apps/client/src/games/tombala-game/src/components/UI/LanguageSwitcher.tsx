import React from 'react'; // React: JSX desteği ve bileşen tanımları için
import { useTranslation } from 'react-i18next'; // useTranslation: çeviri ve dil değiştirme fonksiyonları sağlar
import { Select, MenuItem, FormControl, Box } from '@mui/material'; // Select, MenuItem, FormControl, Box: MUI UI bileşenleri
import { SelectChangeEvent } from '@mui/material/Select'; // SelectChangeEvent: Select bileşeni değişim olay tipi

// LanguageSwitcher: uygulama dilini seçmek için açılır menü bileşeni
const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation(); // i18n: mevcut dil ve changeLanguage fonksiyonu içerir

  // handleLanguageChange: kullanıcı dil seçimini i18n ile günceller
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  // UI: dil seçeneklerini gösteren Select bileşeni
  return (
    <Box sx={{ minWidth: 80, mr: 1 }}>
      <FormControl fullWidth size="small">
        {/* FormControl: Select bileşenine stil ve konteyner sağlar */}
        <Select
          value={i18n.language.split('-')[0]} // i18n.language'dan base dili alır (örn. 'en')
          onChange={handleLanguageChange}
          variant="outlined"
          sx={{ color: 'inherit', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root': { color: 'white' } }}
        >
          {/* Dil seçenekleri */}
          <MenuItem value="en">EN</MenuItem>
          <MenuItem value="tr">TR</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;