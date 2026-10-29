export const DIFFICULTY_LEVELS = Object.freeze([
  { id:'sd', label:'SD', description:{id:'Mudah',en:'Easy'} },
  { id:'smp', label:'SMP', description:{id:'Sedang',en:'Medium'} },
  { id:'sma', label:'SMA', description:{id:'Sulit',en:'Hard'} },
  { id:'sma-plus', label:'SMA+', description:{id:'Sangat sulit',en:'Very hard'} },
  { id:'universitas', label:'Universitas', description:{id:'Tantangan tertinggi',en:'Ultimate challenge'} },
]);
export const LEVEL_IDS = DIFFICULTY_LEVELS.map(level=>level.id);
export function normalizeLevel(value) { return LEVEL_IDS.includes(value)?value:'sd'; }
export function levelLabel(value) { return DIFFICULTY_LEVELS.find(level=>level.id===value)?.label || 'SD'; }
export const GAME_SETTINGS_KEY='ba_game_settings_v2';
