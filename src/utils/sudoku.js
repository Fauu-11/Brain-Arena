/**
 * Generate a complete valid Sudoku in O(size^2), including rectangular boxes.
 * Randomly permute symbols, bands/stacks and rows/columns within their groups.
 * Every transformation preserves the row, column and box constraints.
 * This generates the memorization solution, not a unique-solution clue puzzle.
 */
export function generateSudokuMatrix(size, boxRows, boxCols, random = Math.random) {
  if (![size, boxRows, boxCols].every(Number.isInteger) || size < 1 ||
      boxRows < 1 || boxCols < 1 || boxRows * boxCols !== size) {
    throw new RangeError('Sudoku size must equal boxRows * boxCols.');
  }
  const range = length => Array.from({ length }, (_, i) => i);
  const shuffle = values => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const rows = shuffle(range(size / boxRows)).flatMap(band =>
    shuffle(range(boxRows)).map(row => band * boxRows + row));
  const cols = shuffle(range(size / boxCols)).flatMap(stack =>
    shuffle(range(boxCols)).map(col => stack * boxCols + col));
  const symbols = shuffle(range(size).map(i => i + 1));
  return rows.flatMap(row => cols.map(col =>
    symbols[(boxCols * (row % boxRows) + Math.floor(row / boxRows) + col) % size]));
}
