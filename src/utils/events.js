import { shiftDateKey, localDateKey } from './progression.js';

const EVENT_ROTATION = [
  { id:'logic-week', category:'logic', title:{id:'Logic Week',en:'Logic Week'}, description:{id:'Minesweeper, Sudoku, Digit Piksel, dan puzzle logika mendapat bonus XP.',en:'Minesweeper, Sudoku, Pixel Digits, and logic puzzles earn bonus XP.'} },
  { id:'memory-focus', category:'memory', title:{id:'Memory Focus',en:'Memory Focus'}, description:{id:'Latih daya ingat dan raih bonus dari semua game memori.',en:'Train recall and earn a bonus from every memory game.'} },
  { id:'math-sprint', category:'math', title:{id:'Math Sprint',en:'Math Sprint'}, description:{id:'Kecepatan berhitung sedang naik daun. Game matematika mendapat bonus XP.',en:'Mental math takes center stage. Mathematics games earn bonus XP.'} },
  { id:'strategy-week', category:'strategy', title:{id:'Strategy Week',en:'Strategy Week'}, description:{id:'Rencanakan langkah terbaik di game strategi untuk bonus XP.',en:'Plan smarter moves in strategy games for bonus XP.'} },
];

function mondayOf(dateKey) {
  const [y,m,d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y,m-1,d));
  const day = date.getUTCDay();
  const back = day === 0 ? 6 : day - 1;
  return shiftDateKey(dateKey,-back);
}

export function getActiveEvent(dateKey = localDateKey()) {
  const monday = mondayOf(dateKey);
  const epoch = Date.UTC(2026,8,28);
  const [y,m,d] = monday.split('-').map(Number);
  const weekIndex = Math.max(0,Math.floor((Date.UTC(y,m-1,d)-epoch)/(7*86400000)));
  const base = EVENT_ROTATION[weekIndex % EVENT_ROTATION.length];
  return {
    ...base,
    id:`${base.id}-${monday}`,
    start:monday,
    end:shiftDateKey(monday,6),
    multiplier:1.5,
    bonusPercent:50,
  };
}

export function eventBonusForGame(game, baseXp, dateKey = localDateKey()) {
  const event = getActiveEvent(dateKey);
  if (!game || game.category !== event.category) return { event, bonus:0, eligible:false };
  return { event, bonus:Math.round(Math.max(0,Number(baseXp)||0)*(event.multiplier-1)), eligible:true };
}
