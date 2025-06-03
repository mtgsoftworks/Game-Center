/**
 * src/components/Game/OpponentProgress.tsx: Rakip oyuncuların kartlarındaki ilerlemeyi gösteren bileşen.
 * Rakiplerin işaretlediği numaralar ve kalan hane sayısı görselleştirilir.
 *
 * @param {object} props - Rakiplerin kart durumu ve işaretli numaralar.
 * @returns {JSX.Element} Rakip ilerlemesi arayüzü.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Player } from '../../types/GameTypes';

interface OpponentProgressProps {
  players: Record<string, Player>;
}

const OpponentProgress: React.FC<OpponentProgressProps> = ({ players }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const entry = Object.entries(players).find(([id]) => id !== currentUser?.uid);
  if (!entry) return null;
  const [, opponent] = entry;
  const markedCount = opponent.marks.flat().filter(Boolean).length;
  const total = opponent.board.flat().length;
  const percent = (markedCount / (total || 1)) * 100;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{t('game.opponentProgress')}</h3>
      <div className="flex items-center">
        <div className="h-4 bg-gray-200 rounded-full flex-1 mr-2 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm">{markedCount}/{total}</span>
      </div>
    </div>
  );
};

export default OpponentProgress;
