/**
 * Oyun mantığı ve Board sınıfı ile ilgili yardımcı fonksiyonlar.
 * Tile ve Board sınıfları ile oyun akışı ve taş hareketleri yönetilir.
 * rotateLeft fonksiyonu matris döndürmek için kullanılır.
 */

/**
 * rotateLeft: Verilen matrisi sola 90 derece döndürür.
 * @param {Array<Array<number>>} matrix - Döndürülecek 2D sayı matrisi.
 * @returns {Array<Array<number>>} Döndürülmüş matrisi içeren yeni 2D dizi.
 */
var rotateLeft = function (matrix) {
  var rows = matrix.length;
  var columns = matrix[0].length;
  var res = [];
  for (var row = 0; row < rows; ++row) {
    res.push([]);
    for (var column = 0; column < columns; ++column) {
      res[row][column] = matrix[column][columns - row - 1];
    }
  }
  return res;
};

// Tile sınıfı: Her bir hücredeki taşı (tile) temsil eder.
// Taşın değeri, konumu, eski konumu, birleşme durumu ve benzersiz id'si gibi özellikleri vardır.
class Tile {
  /**
   * Yeni bir Tile (taş) nesnesi oluşturur.
   * @param {number} value - Taşın üzerindeki sayı değeri.
   * @param {number} row - Taşın bulunduğu satır.
   * @param {number} column - Taşın bulunduğu sütun.
   */
  constructor(value, row, column) {
    this.value = value || 0;
    this.row = row || -1;
    this.column = column || -1;
    this.oldRow = -1;
    this.oldColumn = -1;
    this.markForDeletion = false;
    this.mergedInto = null;
    this.id = this.id++ || 0;
  }

  /**
   * Taşı belirtilen konuma taşır ve eski konumunu kaydeder.
   * @param {number} row - Yeni satır.
   * @param {number} column - Yeni sütun.
   */
  moveTo(row, column) {
    this.oldRow = this.row;
    this.oldColumn = this.column;
    this.row = row;
    this.column = column;
  }

  /**
   * Taş yeni mi (oyuna yeni eklendi mi) kontrolü.
   * @returns {boolean}
   */
  isNew() {
    return this.oldRow === -1 && !this.mergedInto;
  }

  /**
   * Taşın hareket edip etmediğini kontrol eder.
   * @returns {boolean}
   */
  hasMoved() {
    return (
      (this.fromRow() !== -1 &&
        (this.fromRow() !== this.toRow() ||
          this.fromColumn() !== this.toColumn())) ||
      this.mergedInto
    );
  }

  /**
   * Taşın geldiği satır.
   * @returns {number}
   */
  fromRow() {
    return this.mergedInto ? this.row : this.oldRow;
  }

  /**
   * Taşın geldiği sütun.
   * @returns {number}
   */
  fromColumn() {
    return this.mergedInto ? this.column : this.oldColumn;
  }

  /**
   * Taşın gittiği satır.
   * @returns {number}
   */
  toRow() {
    return this.mergedInto ? this.mergedInto.row : this.row;
  }

  /**
   * Taşın gittiği sütun.
   * @returns {number}
   */
  toColumn() {
    return this.mergedInto ? this.mergedInto.column : this.column;
  }
}

// Board sınıfı: Oyun tahtasını ve tüm taşları yönetir.
// Tahta boyutu, skor, taşlar, hücreler ve hareket yönleri gibi özellikleri vardır.
class Board {
  /**
   * Yeni bir Board (oyun tahtası) oluşturur ve başlangıç taşlarını ekler.
   */
  constructor() {
    this.tiles = [];
    this.cells = [];
    this.score = 0;
    this.size = 4;
    this.fourProbability = 0.1;
    this.deltaX = [-1, 0, 1, 0];
    this.deltaY = [0, -1, 0, 1];
    for (var i = 0; i < this.size; ++i) {
      this.cells[i] = [
        this.addTile(),
        this.addTile(),
        this.addTile(),
        this.addTile(),
      ];
    }
    this.addRandomTile();
    this.addRandomTile();
    this.setPositions();
    this.won = false;
  }

  /**
   * Yeni bir taş oluşturur ve taşlar listesine ekler.
   * @param {object} args - Taş özellikleri.
   * @returns {Tile}
   */
  addTile(args) {
    var res = new Tile(args);
    this.tiles.push(res);
    return res;
  }

  /**
   * Satırdaki taşları sola hareket ettirir ve birleştirir.
   * @returns {boolean} Değişiklik olduysa true döner.
   */
  moveLeft() {
    var hasChanged = false;
    for (var row = 0; row < this.size; ++row) {
      var currentRow = this.cells[row].filter((tile) => tile.value !== 0);
      var resultRow = [];
      for (var target = 0; target < this.size; ++target) {
        var targetTile = currentRow.length
          ? currentRow.shift()
          : this.addTile();
        if (currentRow.length > 0 && currentRow[0].value === targetTile.value) {
          var tile1 = targetTile;
          targetTile = this.addTile(targetTile.value);
          tile1.mergedInto = targetTile;
          var tile2 = currentRow.shift();
          tile2.mergedInto = targetTile;
          targetTile.value += tile2.value;
          this.score += tile1.value + tile2.value;
        }
        resultRow[target] = targetTile;
        this.won |= targetTile.value === 2048;
        hasChanged |= targetTile.value !== this.cells[row][target].value;
      }
      this.cells[row] = resultRow;
    }
    return hasChanged;
  }

  /**
   * Tüm taşların konumlarını günceller.
   */
  setPositions() {
    this.cells.forEach((row, rowIndex) => {
      row.forEach((tile, columnIndex) => {
        tile.oldRow = tile.row;
        tile.oldColumn = tile.column;
        tile.row = rowIndex;
        tile.column = columnIndex;
        tile.markForDeletion = false;
      });
    });
  }

  /**
   * Rastgele bir boş hücreye yeni bir taş ekler.
   */
  addRandomTile() {
    var emptyCells = [];
    for (var r = 0; r < this.size; ++r) {
      for (var c = 0; c < this.size; ++c) {
        if (this.cells[r][c].value === 0) {
          emptyCells.push({ r: r, c: c });
        }
      }
    }
    var index = ~~(Math.random() * emptyCells.length);
    var cell = emptyCells[index];
    var newValue = Math.random() < this.fourProbability ? 4 : 2;
    this.cells[cell.r][cell.c] = this.addTile(newValue);
  }

  /**
   * Belirtilen yönde hareket gerçekleştirir.
   * @param {number} direction - Hareket yönü (0: sola, 1: yukarı, 2: sağa, 3: aşağı).
   * @returns {Board} Oyun tahtası.
   */
  move(direction) {
    // 0 -> left, 1 -> up, 2 -> right, 3 -> down
    this.clearOldTiles();
    for (var i = 0; i < direction; ++i) {
      this.cells = rotateLeft(this.cells);
    }
    var hasChanged = this.moveLeft();
    for (let i = direction; i < 4; ++i) {
      this.cells = rotateLeft(this.cells);
    }
    if (hasChanged) {
      this.addRandomTile();
    }
    this.setPositions();
    return this;
  }

  /**
   * Eski taşları temizler.
   */
  clearOldTiles() {
    this.tiles = this.tiles.filter((tile) => tile.markForDeletion === false);
    this.tiles.forEach((tile) => {
      tile.markForDeletion = true;
    });
  }

  /**
   * Oyunun kazanıldığını kontrol eder.
   * @returns {boolean}
   */
  hasWon() {
    return this.won;
  }

  /**
   * Oyunun kaybedildiğini kontrol eder.
   * @returns {boolean}
   */
  hasLost() {
    var canMove = false;
    for (var row = 0; row < this.size; ++row) {
      for (var column = 0; column < this.size; ++column) {
        canMove |= this.cells[row][column].value === 0;
        for (var dir = 0; dir < 4; ++dir) {
          var newRow = row + this.deltaX[dir];
          var newColumn = column + this.deltaY[dir];
          if (
            newRow < 0 ||
            newRow >= this.size ||
            newColumn < 0 ||
            newColumn >= this.size
          ) {
            continue;
          }
          canMove |=
            this.cells[row][column].value ===
            this.cells[newRow][newColumn].value;
        }
      }
    }
    return !canMove;
  }
}

export { Board };
