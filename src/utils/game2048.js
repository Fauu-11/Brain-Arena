export function empty2048() { return Array(16).fill(0); }
export function addRandomTile(board, random=Math.random) {
  const empty=[]; board.forEach((value,index)=>{ if (!value) empty.push(index); });
  if (!empty.length) return [...board];
  const next=[...board]; const index=empty[Math.floor(random()*empty.length)]; next[index]=random()<.9?2:4; return next;
}
export function create2048(random=Math.random) { return addRandomTile(addRandomTile(empty2048(),random),random); }
function slideLine(line) {
  const compact=line.filter(Boolean); const out=[]; let score=0;
  for (let i=0;i<compact.length;i+=1) {
    if (compact[i]===compact[i+1]) { const value=compact[i]*2; out.push(value); score+=value; i+=1; }
    else out.push(compact[i]);
  }
  while (out.length<4) out.push(0);
  return { line:out,score };
}
export function move2048(board,direction) {
  const get=(r,c)=>board[r*4+c]; const result=Array(16).fill(0); let score=0;
  for (let outer=0;outer<4;outer+=1) {
    let line=[];
    for (let inner=0;inner<4;inner+=1) {
      const r=direction==='left'||direction==='right'?outer:inner;
      const c=direction==='left'||direction==='right'?inner:outer;
      line.push(get(r,c));
    }
    if (direction==='right'||direction==='down') line.reverse();
    const slid=slideLine(line); score+=slid.score; let values=slid.line;
    if (direction==='right'||direction==='down') values=[...values].reverse();
    for (let inner=0;inner<4;inner+=1) {
      const r=direction==='left'||direction==='right'?outer:inner;
      const c=direction==='left'||direction==='right'?inner:outer;
      result[r*4+c]=values[inner];
    }
  }
  return { board:result,score,moved:result.some((value,index)=>value!==board[index]) };
}
export function canMove2048(board) {
  if (board.some(value=>value===0)) return true;
  for (let r=0;r<4;r+=1) for (let c=0;c<4;c+=1) {
    const value=board[r*4+c]; if (c<3&&value===board[r*4+c+1]) return true; if (r<3&&value===board[(r+1)*4+c]) return true;
  }
  return false;
}
