import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';

interface BingoCardProps {
  numbers: number[];
  drawnNumbers: Set<number>;
  initialMarkedNumbers?: Set<number>;
  isPlayerCard?: boolean;
  onMarkNumber?: (number: number, isMarking: boolean) => void;
}

const BingoCard: React.FC<BingoCardProps> = ({ 
  numbers, 
  drawnNumbers, 
  initialMarkedNumbers = new Set(), 
  isPlayerCard = false,
  onMarkNumber
}) => {
  // Local state for marked numbers (for player interactivity)
  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(initialMarkedNumbers);

  // Pending confirmation highlights for newly drawn numbers
  const [pendingNumbers, setPendingNumbers] = useState<Set<number>>(new Set());
  const previousDrawnRef = useRef<Set<number>>(new Set());
  const pendingTimersRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Update local state when props change
  useEffect(() => {
    setMarkedNumbers(initialMarkedNumbers);
  }, [initialMarkedNumbers]);

  // Highlight newly drawn numbers for 5 seconds
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

  // Clear timers on unmount
  useEffect(() => () => {
    Object.values(pendingTimersRef.current).forEach(clearTimeout);
  }, []);

  // Handle number click (toggle mark)
  const handleNumberClick = (number: number) => {
    if (!isPlayerCard || !onMarkNumber) return; // Only allow clicks for player's card

    const isCurrentlyMarked = markedNumbers.has(number);
    onMarkNumber(number, !isCurrentlyMarked);
  };

  // Helper to determine cell styling
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
      aspectRatio: '1/1', // Ensure square cells
      boxShadow: isPending ? '0 0 0 2px #2196f3 inset' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        opacity: isPlayerCard ? 0.9 : 1,
        transform: isPlayerCard ? 'scale(1.05)' : 'none',
      }
    };
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)', // Create 5 equal columns
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