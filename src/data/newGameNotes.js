import {NEW_GAME_PRESETS} from '../utils/newGameRules.js';
export const EXTRA_LEVEL_NOTES=Object.fromEntries(Object.entries(NEW_GAME_PRESETS).map(([id,levels])=>[id,Object.fromEntries(Object.entries(levels).map(([level,c])=>{
 let a,b;
 if(id==='codebreaker'){a=`${c.length} digit · angka 0–${c.symbols-1} · ${c.attempts} percobaan`;b=`${c.length} digits · 0–${c.symbols-1} · ${c.attempts} attempts`;}
 if(id==='lightsout'){a=b=`${c.size}×${c.size}`;a+=' · pola acak yang bisa dipadamkan';b+=' · solvable randomized pattern';}
 if(id==='sequence'){a=`${c.symbols} tombol · mulai ${c.start} langkah · ${c.rounds} ronde · ${c.beat} ms/angka`;b=`${c.symbols} buttons · start ${c.start} steps · ${c.rounds} rounds · ${c.beat} ms/number`;}
 if(id==='kakuro'){a=`Kelompok ${c.blocks[0]} angka · ${c.blocks.length**2} wilayah silang · solusi unik`;b=`Groups of ${c.blocks[0]} digits · ${c.blocks.length**2} crossing regions · unique solution`;}
 if(id==='slitherlink'){a=`${c.size}×${c.size} · satu lingkaran dengan solusi unik`;b=`${c.size}×${c.size} · one loop with a unique solution`;}
 return [level,{id:a,en:b}];}))]));
