/**
 * src/components/Game/NumberDraw.tsx: Tombala oyununda çekilen sayıları ve animasyonunu gösteren bileşen.
 * Son çekilen numarayı ve geçmiş çekilişleri kullanıcıya sunar.
 *
 * @param {object} props - Çekilen numaralar ve animasyon kontrolü.
 * @returns {JSX.Element} Çekiliş animasyonu ve numara arayüzü.
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// NumberDrawProps arayüzü: Çekilen numaraların tipini tanımlar
interface NumberDrawProps {
  drawnNumbers: number[] | undefined; // Çekilmiş numaralar dizisi
}

// NumberDraw bileşeni: Son çekilen numarayı animasyonla ve geçmişiyle gösterir
const NumberDraw: React.FC<NumberDrawProps> = ({ drawnNumbers }) => {
  const { t } = useTranslation();
  const numbers = drawnNumbers || [];
  const lastDrawnNumber = numbers.length > 0 ? numbers[numbers.length - 1] : null;
  const history = numbers.join(', ');
  const count = numbers.length;

  return (
    <Paper elevation={2} sx={{ p: 2, minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
      {/* Başlık: Çekilen numaralar */}
      <Typography variant="h6" align="center" gutterBottom>
        {t('drawnNumbersTitle')}
      </Typography>
      
      {/* Son çekilen numara animasyonu ile gösterilir */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {lastDrawnNumber !== null ? (
          <motion.div
            key={lastDrawnNumber}
            initial={{ scale: 0.5, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Typography variant="h2" color="primary" component="div">
              {lastDrawnNumber}
            </Typography>
          </motion.div>
        ) : (
          // Hiç numara çekilmediyse bilgi mesajı göster
          <Typography variant="h5" color="textSecondary"><i>{t('noNumbersDrawn')}</i></Typography>
        )}
      </Box>

      {/* Geçmiş çekilişler ve toplam */}
      <Box sx={{ width: '100%', mt: 2, maxHeight: '100px', overflowY: 'auto', borderTop: '1px solid lightgrey', pt: 1 }}>
         <Typography align="center" variant="body2" sx={{ wordBreak: 'break-word'}}>
            {t('history')}: {history || t('none')}
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ mt: 1 }}>{t('totalDrawn')}: {count}/90</Typography>
    </Paper>
  );
};

export default NumberDraw; 