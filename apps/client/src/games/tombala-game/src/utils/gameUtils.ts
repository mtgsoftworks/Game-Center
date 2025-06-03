/**
 * src/utils/gameUtils.ts: Tombala oyununda kart üretimi, kazanma kontrolü ve kazanan belirleme gibi yardımcı fonksiyonları içerir.
 * Tüm fonksiyonlar ve hata mesajları Türkçedir, kodun başında açıklama ve fonksiyon başlarında detaylı Türkçe yorumlar bulunur.
 */

/**
 * Opsiyonel seed ile deterministik kart üretimi için RNG fonksiyonu.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    // LCG parametreleri
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Bingo kartı için benzersiz rastgele sayılar üreten fonksiyon.
 * @param count Gerekli benzersiz sayı adedi (ör: 5x5 kart için 25).
 * @param min Aralıktaki minimum sayı (dahil, ör: 1).
 * @param max Aralıktaki maksimum sayı (dahil, ör: 90).
 * @param seed Opsiyonel, deterministik üretim için kullanılacak seed.
 * @returns Benzersiz rastgele sayılardan oluşan dizi.
 * @throws Aralık, istenen sayı adedinden küçükse hata fırlatır.
 */
export const generateBingoCardNumbers = (
  count: number,
  min: number,
  max: number,
  seed?: number
): number[] => {
  if (max - min + 1 < count) {
    throw new Error('Aralık, istenen kadar benzersiz sayı üretmek için yeterli değil.');
  }

  // RNG fonksiyonunu seç
  const rnd = seed !== undefined ? createSeededRandom(seed) : Math.random;
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNum = Math.floor(rnd() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }

  // Set'i diziye çevir ve karıştır (Fisher-Yates algoritması)
  const shuffledNumbers = Array.from(numbers);
  for (let i = shuffledNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
  }

  return shuffledNumbers;
};

/**
 * Bir bingo kartında kazanma satırı (satır, sütun veya çapraz) olup olmadığını kontrol eder.
 * @param cardNumbers Karttaki 25 sayının düz dizisi.
 * @param markedNumbers İşaretlenmiş sayıların Set'i.
 * @returns Kazanma satırı varsa true, yoksa false.
 */
export const checkBingoWin = (
  cardNumbers: number[],
  markedNumbers: Set<number>,
): boolean => {
  if (cardNumbers.length !== 25) {
    console.error('Kazanma kontrolü için kart uzunluğu geçersiz');
    return false;
  }

  const size = 5; // 5x5 kart

  // Belirli bir indeksin işaretli olup olmadığını kontrol eden yardımcı fonksiyon
  const isMarked = (index: number): boolean => {
    return markedNumbers.has(cardNumbers[index]);
  };

  // Satırları kontrol et
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

  // Sütunları kontrol et
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

  // Çaprazları kontrol et
  let diag1 = true;
  let diag2 = true;
  for (let i = 0; i < size; i++) {
    if (!isMarked(i * size + i)) diag1 = false;
    if (!isMarked(i * size + (size - i - 1))) diag2 = false;
  }
  if (diag1 || diag2) return true;

  return false;
};

/**
 * Her çekilişten sonra bingo kazananını ve türünü belirleyen fonksiyon (Tek Satır, Çift Satır, Full House).
 * @param cards Oyuncu kartları ve id'leri.
 * @param drawnNumbers Çekilen tüm sayılar.
 * @returns Kazanan bilgisi ve türü. Kazanan yoksa null döner.
 */
export type WinnerResult = {
  winnerId: string | null;
  winType: "Tek Satır" | "Çift Satır" | "Full House" | null;
  winningRows: number[];
  allMarkedCoordinates: [number, number][];
};

/**
 * Her çekilişten sonra bingo kazananını ve türünü belirleyen fonksiyon (Tek Satır, Çift Satır, Full House).
 * @param cards Oyuncu kartları ve id'leri.
 * @param drawnNumbers Çekilen tüm sayılar.
 * @returns Kazanan bilgisi ve türü. Kazanan yoksa null döner.
 */
export const checkForWinner = (
  cards: { id: string; cardNumbers: number[] }[],
  drawnNumbers: number[]
): WinnerResult => {
  const drawnSet = new Set(drawnNumbers);
  let winnerId: string | null = null;
  let winType: "Tek Satır" | "Çift Satır" | "Full House" | null = null;
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
        winType = "Çift Satır";
        winningRows = completeRows.slice(0, 2);
      } else {
        winType = "Tek Satır";
        winningRows = [completeRows[0]];
      }
      break;
    }
  }

  return { winnerId, winType, winningRows, allMarkedCoordinates };
};
