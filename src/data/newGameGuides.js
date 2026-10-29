import {EXTRA_CONTENT} from './newGameContent.js';
import {DIFFICULTY_LEVELS} from './difficulties.js';
import {EXTRA_LEVEL_NOTES} from './newGameNotes.js';
const bi=(id,en)=>({id,en});
export const EXTRA_GUIDES=Object.fromEntries(Object.entries(EXTRA_CONTENT).map(([id,c])=>[id,{
 objective:c.summary,victory:bi('Selesaikan tujuan papan sesuai seluruh aturan yang aktif.','Complete the board objective under every active rule.'),
 facts:[{label:bi('Tingkat','Levels'),value:bi('SD → Universitas','SD → Universitas')},{label:bi('Mode','Mode'),value:bi('Solo, lokal','Solo, local')},{label:bi('Variasi Universitas','Universitas variations'),value:bi('3 aturan acak','3 random rules')}],
 controls:[bi('Ketuk tombol atau petak pada papan.','Tap a board cell or button.'),bi('Gunakan keyboard angka dan Enter pada kontrol yang mendukungnya.','Use number keys and Enter where supported.'),bi('Geser area papan besar untuk melihat seluruh bagian.','Scroll a large board to see every part.')],
 tutorial:c.rules.id.map((text,i)=>({title:bi(`Langkah ${i+1}`,`Step ${i+1}`),text:bi(text,c.rules.en[i])})),
 solve:{title:bi('Baca aturan, rencanakan, periksa','Read, plan and verify'),intro:c.summary,steps:c.tips.map((tip,i)=>({title:bi(`Strategi ${i+1}`,`Strategy ${i+1}`),text:tip})),example:c.example},
 mistakes:[bi('Bertindak sebelum membaca variasi Universitas yang aktif.','Acting before reading the active Universitas rule.'),bi('Mengabaikan informasi dari langkah sebelumnya.','Ignoring information from previous moves.'),bi('Mengirim jawaban sebelum memeriksa seluruh syarat kemenangan.','Submitting before checking every winning condition.')],
 levels:DIFFICULTY_LEVELS.map(level=>({name:level.label,detail:EXTRA_LEVEL_NOTES[id][level.id]})),
}]));
export const EXTRA_SCREEN_GUIDES=Object.fromEntries(Object.entries(EXTRA_CONTENT).map(([id,c])=>[id,{steps:{id:c.rules.id.slice(0,3),en:c.rules.en.slice(0,3)},tip:c.tips[0],input:bi('Gunakan kontrol sentuh, keyboard angka, atau Enter/Spasi pada tombol.','Use touch controls, number keys, or Enter/Space on buttons.')} ]));
