/**
 * src/components/Game/BingoCard.tsx: Kullanıcıya ait tombala kartını gösteren bileşen.
 * Kart üzerindeki numaraları ve işaretlenmiş haneleri yönetir ve gösterir.
 *
 * @param {object} props - Kart bilgisi ve işaretli numaralar.
 * @returns {JSX.Element} Tombala kartı arayüzü.
 */

// React ve hook'lar: component, state yönetimi, yan etki ve ref kullanımı
import React, { useState, useEffect, useRef } from 'react';
// Box, Paper: Material UI düzen ve yüzey bileşenleri
import { Box, Paper } from '@mui/material';

// BingoCardProps: kart numaraları ve işaretli hücrelerin tiplerini tanımlar
interface BingoCardProps {
  numbers: number[]; // Kart üzerindeki tüm numaralar
  drawnNumbers: Set<number>; // Çekilmiş numaralar
  initialMarkedNumbers?: Set<number>; // Başlangıçta işaretli olan numaralar
  isPlayerCard?: boolean; // Oyuncu kartı mı?
  onMarkNumber?: (number: number, isMarking: boolean) => void; // Numara işaretleme callback'i
}

// BingoCard: tombala kartını render eden, işaretleme ve vurgulamayı yöneten bileşen
const BingoCard: React.FC<BingoCardProps> = ({ 
  numbers, 
  drawnNumbers, 
  initialMarkedNumbers = new Set(), 
  isPlayerCard = false,
  onMarkNumber
}) => {
  // markedNumbers: kullanıcının işaretlediği numaraların set'i
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(initialMarkedNumbers);

  // pendingNumbers: yeni çekilen numaraları geçici vurgulamak için set
  const [pendingNumbers, setPendingNumbers] = useState<Set<number>>(new Set());
  // previousDrawnRef: önceki drawnNumbers set'ini saklar
  const previousDrawnRef = useRef<Set<number>>(new Set());
  // pendingTimersRef: her numara için vurgulama zamanlayıcılarını saklar
  const pendingTimersRef = useRef<Record<number, NodeJS.Timeout>>({});

  // initialMarkedNumbers değiştiğinde markedNumbers state'ini günceller
  useEffect(() => {
    setMarkedNumbers(initialMarkedNumbers);
  }, [initialMarkedNumbers]);

  // drawnNumbers değiştiğinde yeni eklenen numaraları 5 saniye vurgular
  useEffect(() => {
    const newSet = new Set(drawnNumbers);
    const added = Array.from(newSet).filter(n => !previousDrawnRef.current.has(n));
    added.forEach(n => {
      setPendingNumbers(prev => new Set(prev).add(n));
      pendingTimersRef.current[n] = setTimeout(() => {
        setPendingNumbers(prev => {
          const copy = new Set(prev);
          copy.delete(n);
          return copy;
        });
        delete pendingTimersRef.current[n];
      }, 5000);
    });
    previousDrawnRef.current = newSet;
  }, [drawnNumbers]);

  // Bileşen unmount olduğunda tüm zamanlayıcıları temizler
  useEffect(() => () => {
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
  }, []);

  // handleNumberClick: hücre tıklandığında işaretleme callback'ini tetikler
  const handleNumberClick = (number: number) => {
    if (!isPlayerCard || !onMarkNumber) return; // Sadece oyuncu kartı için tıklatma izni ver

    const isCurrentlyMarked = markedNumbers.has(number);
    onMarkNumber(number, !isCurrentlyMarked);
  };

  // getCellStyle: numaraya göre hücre stilini seçer (işaretli, vurgulu, normal)
  const getCellStyle = (number: number) => {
    const isPending = pendingNumbers.has(number);
    const isMarked = markedNumbers.has(number);
    
    return {
      cursor: isPlayerCard ? 'pointer' : 'default',
      backgroundColor: isMarked ? '#4caf50' : isPending ? '#bbdefb' : 'white',
      color: isMarked ? 'white' : 'black',
      fontWeight: isPending ? 'bold' : 'normal',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      aspectRatio: '1/1', // Kare hücreler oluşturur
      boxShadow: isPending ? '0 0 0 2px #2196f3 inset' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        opacity: isPlayerCard ? 0.9 : 1,
        transform: isPlayerCard ? 'scale(1.05)' : 'none',
      }
    };
  };

  // Kart hücrelerini grid şeklinde render eder
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)', // 5 eşit sütun oluştur
          gap: 1,
          width: '100%',
          height: '100%'
        }}
      >
        {numbers.map((number, index) => (
          <Box
            key={index}
            sx={getCellStyle(number)}
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default BingoCard; 