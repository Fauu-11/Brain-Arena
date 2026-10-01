const OFFLINE_KEY='ba_offline_games_v1';
export function loadOfflineSelection(){try{const v=JSON.parse(localStorage.getItem(OFFLINE_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return[];}}
export function saveOfflineSelection(ids){const next=[...new Set(ids||[])];try{localStorage.setItem(OFFLINE_KEY,JSON.stringify(next));}catch{}return next;}
export async function prefetchGameModule(id){const loaders={
 '300':()=>import('../games/Game300.jsx'),prime:()=>import('../games/GamePrime.jsx'),pixel:()=>import('../games/GamePixel.jsx'),mnm:()=>import('../games/GameMnM.jsx'),cube:()=>import('../games/GameCube.jsx'),rps:()=>import('../games/GameRPS.jsx'),sudoku:()=>import('../games/GameSudoku.jsx'),minesweeper:()=>import('../games/GameMinesweeper.jsx'),maze:()=>import('../games/GameMaze.jsx'),matrix:()=>import('../games/GameMemoryMatrix.jsx'),nonogram:()=>import('../games/GameNonogram.jsx'),game2048:()=>import('../games/Game2048.jsx')};
 if(!loaders[id])return false;await loaders[id]();return true;
}
export async function prefetchGames(ids,onProgress=()=>{}){let done=0;for(const id of ids){await prefetchGameModule(id);done++;onProgress(done,ids.length,id);}saveOfflineSelection(ids);return done;}
