import { masteryFromProfile } from './mastery.js';

export function adaptiveRecommendation(profile, gameId) {
  const mastery = masteryFromProfile(profile,gameId);
  const completions = Math.max(0,Number(profile?.perGame?.[gameId]?.completions)||0);
  if (mastery.level >= 10 || completions >= 18) return { level:'universitas', universityDifficulty:mastery.level >= 18 ? 'extreme' : mastery.level >= 14 ? 'very-hard' : 'hard', label:{id:'Universitas',en:'University'}, reason:{id:'Mastery tinggi: waktunya mencoba tantangan tingkat universitas.',en:'High mastery: you are ready for a university-level challenge.'} };
  if (mastery.level >= 7 || completions >= 10) return { level:'sma', label:{id:'SMA',en:'High school'}, reason:{id:'Konsistensimu sudah cukup untuk tantangan lanjutan.',en:'Your consistency is ready for an advanced challenge.'} };
  if (mastery.level >= 3 || completions >= 4) return { level:'smp', label:{id:'SMP',en:'Middle school'}, reason:{id:'Dasar sudah terbentuk. Naik satu tingkat untuk menjaga progres.',en:'Your foundation is set. Move up one level to keep progressing.'} };
  return { level:'sd', label:{id:'SD',en:'Primary'}, reason:{id:'Mulai dari fondasi untuk memahami mekanik tanpa terburu-buru.',en:'Start with the foundation to learn the mechanics comfortably.'} };
}
