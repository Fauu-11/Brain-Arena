export function nonogramClues(line=[]) {
  const clues=[]; let run=0;
  for (const cell of line) { if (cell) run+=1; else if (run) { clues.push(run); run=0; } }
  if (run) clues.push(run);
  return clues.length ? clues : [0];
}

export function generateNonogram(size=5,density=.42,random=Math.random) {
  if (!Number.isInteger(size) || size<3 || size>25) throw new RangeError('invalid-size');
  const cells=Array.from({length:size*size},()=>random()<density);
  for (let r=0;r<size;r+=1) if (!cells.slice(r*size,(r+1)*size).some(Boolean)) cells[r*size+Math.floor(random()*size)]=true;
  for (let c=0;c<size;c+=1) if (!Array.from({length:size},(_,r)=>cells[r*size+c]).some(Boolean)) cells[Math.floor(random()*size)*size+c]=true;
  const rows=Array.from({length:size},(_,r)=>nonogramClues(cells.slice(r*size,(r+1)*size)));
  const cols=Array.from({length:size},(_,c)=>nonogramClues(Array.from({length:size},(_,r)=>cells[r*size+c])));
  return { size,cells,rows,cols };
}

export function nonogramSolved(solution,marks) {
  if (!Array.isArray(solution) || !Array.isArray(marks) || solution.length!==marks.length) return false;
  const size=Math.sqrt(solution.length);
  if (!Number.isInteger(size)) return false;
  const targetRows=Array.from({length:size},(_,r)=>nonogramClues(solution.slice(r*size,(r+1)*size)));
  const targetCols=Array.from({length:size},(_,c)=>nonogramClues(Array.from({length:size},(_,r)=>solution[r*size+c])));
  const filled=marks.map(value=>value===1);
  const rows=Array.from({length:size},(_,r)=>nonogramClues(filled.slice(r*size,(r+1)*size)));
  const cols=Array.from({length:size},(_,c)=>nonogramClues(Array.from({length:size},(_,r)=>filled[r*size+c])));
  return rows.every((clue,index)=>clue.join(',')===targetRows[index].join(',')) && cols.every((clue,index)=>clue.join(',')===targetCols[index].join(','));
}
