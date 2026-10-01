export const UNIVERSITY_ARENA_KEYS = ['hard', 'very-hard', 'impossible'];

export const UNIVERSITY_ARENA = Object.freeze({
  hard: Object.freeze({ label: 'Hard', id: 'Sulit', en: 'Hard', factor: 1 }),
  'very-hard': Object.freeze({ label: 'Very Hard', id: 'Sangat Sulit', en: 'Very Hard', factor: 1.45 }),
  impossible: Object.freeze({ label: 'Impossible', id: 'Mustahil', en: 'Impossible', factor: 2 }),
});

export function normalizeUniversityDifficulty(value) {
  if (value === 'extreme') return 'impossible';
  return UNIVERSITY_ARENA[value] ? value : 'hard';
}

export function universityArenaLabel(value) {
  return UNIVERSITY_ARENA[normalizeUniversityDifficulty(value)].label;
}

export function universityRecordKey(prefix, schoolLevel, difficulty) {
  return schoolLevel === 'universitas'
    ? `${prefix}_${schoolLevel}_${normalizeUniversityDifficulty(difficulty)}`
    : `${prefix}_${schoolLevel}`;
}
