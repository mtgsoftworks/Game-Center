/**
 * Generates an array of unique random numbers for a Bingo card.
 * @param count The total number of unique numbers required (e.g., 25 for a 5x5 card).
 * @param min The minimum number in the range (inclusive, e.g., 1).
 * @param max The maximum number in the range (inclusive, e.g., 90).
 * @returns An array of unique random numbers.
 * @throws Error if the range is smaller than the required count.
 */
export const generateBingoCardNumbers = (
  count: number,
  min: number,
  max: number,
): number[] => {
  if (max - min + 1 < count) {
    throw new Error('Range is too small to generate the required count of unique numbers.');
  }

  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }

  // Convert Set to Array and shuffle it for good measure (optional, as Set order isn't guaranteed anyway)
  const shuffledNumbers = Array.from(numbers);
  // Fisher-Yates (Knuth) Shuffle
  for (let i = shuffledNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
  }

  return shuffledNumbers;
};

/**
 * Checks if a Bingo card has a winning line (row, column, or diagonal).
 * @param cardNumbers The flat array of 25 numbers on the card.
 * @param markedNumbers A Set containing the numbers that have been marked.
 * @returns True if a winning line exists, false otherwise.
 */
export const checkBingoWin = (
  cardNumbers: number[],
  markedNumbers: Set<number>,
): boolean => {
  if (cardNumbers.length !== 25) {
    console.error('Invalid card numbers length for win check');
    return false;
  }

  const size = 5; // 5x5 grid

  // Helper function to check if a specific index is marked
  const isMarked = (index: number): boolean => {
    return markedNumbers.has(cardNumbers[index]);
  };

  // Check Rows
  for (let i = 0; i < size; i++) {
    let rowComplete = true;
    for (let j = 0; j < size; j++) {
      if (!isMarked(i * size + j)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }

  // Check Columns
  for (let j = 0; j < size; j++) {
    let colComplete = true;
    for (let i = 0; i < size; i++) {
      if (!isMarked(i * size + j)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }

  // Check Diagonals
  // Top-left to bottom-right
  let diag1Complete = true;
  for (let i = 0; i < size; i++) {
    if (!isMarked(i * size + i)) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) return true;

  // Top-right to bottom-left
  let diag2Complete = true;
  for (let i = 0; i < size; i++) {
    if (!isMarked(i * size + (size - 1 - i))) {
      diag2Complete = false;
      break;
    }
  }
  if (diag2Complete) return true;

  // No winning line found
  return false;
};

// New types and function to evaluate Bingo winner after each draw: Single Line, Double Line, Full House
export type WinnerResult = {
  winnerId: string | null;
  winType: "Single Line" | "Double Line" | "Full House" | null;
  winningRows: number[];
  allMarkedCoordinates: [number, number][];
};

export const checkForWinner = (
  cards: { id: string; cardNumbers: number[] }[],
  drawnNumbers: number[]
): WinnerResult => {
  const drawnSet = new Set(drawnNumbers);
  let winnerId: string | null = null;
  let winType: "Single Line" | "Double Line" | "Full House" | null = null;
  let winningRows: number[] = [];
  const allMarkedCoordinates: [number, number][] = [];

  for (let idx = 0; idx < cards.length; idx++) {
    const card = cards[idx];
    // build rows
    const rows: number[][] = [];
    for (let r = 0; r < 5; r++) {
      rows.push(card.cardNumbers.slice(r * 5, r * 5 + 5));
    }
    const completeRows = rows
      .map((row, r) => (row.every(n => drawnSet.has(n)) ? r : -1))
      .filter(r => r !== -1);
    if (completeRows.length > 0) {
      winnerId = card.id;
      if (completeRows.length === 5) {
        winType = "Full House";
        winningRows = [0,1,2,3,4];
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            allMarkedCoordinates.push([r, c]);
          }
        }
      } else if (completeRows.length >= 2) {
        winType = "Double Line";
        winningRows = completeRows.slice(0, 2);
      } else {
        winType = "Single Line";
        winningRows = [completeRows[0]];
      }
      break;
    }
  }

  return { winnerId, winType, winningRows, allMarkedCoordinates };
};
