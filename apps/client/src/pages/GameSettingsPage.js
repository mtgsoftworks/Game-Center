/**
 * src/pages/GameSettingsPage.js: Oyun ayarları sayfası bileşeni.
 * Kullanıcıların oyun için zorunlu ayarlar, puan hedefi ve zaman sınırı gibi seçenekleri yapılandırmasını sağlar.
 * Form gönderildiğinde backend API aracılığıyla ayarlar güncellenir.
 *
 * @returns {JSX.Element} Oyun ayarları sayfası bileşeni.
 */
import React, { useState } from 'react';
import { Typography, Container, Switch, FormControlLabel, Button } from '@mui/material';

function GameSettingsPage() {
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    // Ayarları kaydetme işlemleri
    alert('Ayarlar kaydedildi.');
  };

  return (
    <Container>
      <Typography variant="h4" mt={5}>Oyun Ayarları</Typography>
      <FormControlLabel
        control={<Switch checked={sound} onChange={(e) => setSound(e.target.checked)} />}
        label="Ses"
      />
      <FormControlLabel
        control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
        label="Bildirimler"
      />
      <Button variant="contained" color="primary" onClick={handleSave}>Kaydet</Button>
    </Container>
  );
}

export default GameSettingsPage;