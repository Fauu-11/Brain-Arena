export const MASTERY_XP_PER_COMPLETION = 50;

export function getMasteryInfo(value = 0) {
  const xp = Math.max(0,Math.floor(Number(value)||0));
  let level = 1;
  let floor = 0;
  let cost = 120;
  while (xp >= floor + cost && level < 50) {
    floor += cost;
    level += 1;
    cost = 120 + (level - 1) * 30;
  }
  const tier = level >= 25 ? {id:'Grandmaster',en:'Grandmaster'} : level >= 18 ? {id:'Master',en:'Master'} : level >= 12 ? {id:'Expert',en:'Expert'} : level >= 7 ? {id:'Skilled',en:'Skilled'} : level >= 3 ? {id:'Apprentice',en:'Apprentice'} : {id:'Novice',en:'Novice'};
  return { xp,level,tier,currentXp:xp-floor,neededXp:cost,progress:Math.max(0,Math.min(100,((xp-floor)/cost)*100)),nextLevelXp:floor+cost };
}

export function masteryFromProfile(profile, gameId) {
  return getMasteryInfo(profile?.perGame?.[gameId]?.masteryXp || 0);
}
