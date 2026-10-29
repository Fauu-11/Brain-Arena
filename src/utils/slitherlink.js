import {shuffleValues} from './universityGameplay.js';
export function loopTopology(size){
 const edges=[],cells=Array.from({length:size*size},()=>[]),vertices=Array.from({length:(size+1)**2},()=>[]);
 const add=(a,b,neighbors)=>{const id=edges.length;edges.push([a,b]);vertices[a].push(id);vertices[b].push(id);for(const cell of neighbors)cells[cell].push(id);};
 for(let r=0;r<=size;r++)for(let c=0;c<size;c++)add(r*(size+1)+c,r*(size+1)+c+1,[...(r>0?[(r-1)*size+c]:[]),...(r<size?[r*size+c]:[])]);
 for(let r=0;r<size;r++)for(let c=0;c<=size;c++)add(r*(size+1)+c,(r+1)*(size+1)+c,[...(c>0?[r*size+c-1]:[]),...(c<size?[r*size+c]:[])]);
 return {size,edges,cells,vertices};
}
export function singleLoop(topology,lines){
 const active=lines.map((v,i)=>v===1?i:-1).filter(i=>i>=0);if(!active.length)return false;
 if(topology.vertices.some(edges=>{const degree=edges.filter(i=>lines[i]===1).length;return degree!==0&&degree!==2;}))return false;
 const visited=new Set(),stack=[active[0]];while(stack.length){const edge=stack.pop();if(visited.has(edge))continue;visited.add(edge);for(const vertex of topology.edges[edge])for(const next of topology.vertices[vertex])if(lines[next]===1&&!visited.has(next))stack.push(next);}
 return visited.size===active.length;
}
export function slitherValid(puzzle,marks){return puzzle.fixed.every((value,i)=>value<0||(marks[i]===1?1:0)===value)&&puzzle.clues.every((value,i)=>value===null||puzzle.topology.cells[i].filter(e=>marks[e]===1).length===value)&&singleLoop(puzzle.topology,marks);}
export function countLoopSolutions(puzzle,limit=2,budget=12000){
 let count=0,nodes=0,exhausted=false;const groups=[...puzzle.topology.cells.map((edges,i)=>({edges,target:puzzle.clues[i]})),...puzzle.topology.vertices.map(edges=>({edges,target:null,vertex:true}))];
 function search(input){if(count>=limit||exhausted)return;if(++nodes>budget){exhausted=true;return;}const values=[...input];let changed=true;
  while(changed){changed=false;for(const group of groups){if(!group.vertex&&group.target===null)continue;const on=group.edges.filter(i=>values[i]===1).length,unknown=group.edges.filter(i=>values[i]<0);let force=null;
   if(group.vertex){if(on>2||on===1&&!unknown.length)return;if(on===2)force=0;else if(on===1&&unknown.length===1)force=1;else if(on===0&&unknown.length===1)force=0;}
   else{if(on>group.target||on+unknown.length<group.target)return;if(on===group.target)force=0;else if(on+unknown.length===group.target)force=1;}
   if(force!==null)for(const i of unknown){values[i]=force;changed=true;}
  }}
  let index=-1,best=-1;for(let i=0;i<values.length;i++)if(values[i]<0){const score=groups.filter(g=>g.edges.includes(i)).reduce((s,g)=>s+(g.vertex?2:6)/(1+g.edges.filter(e=>values[e]<0).length),0);if(score>best){best=score;index=i;}}
  if(index<0){if(slitherValid(puzzle,values))count++;return;}
  for(const v of [1,0]){const next=[...values];next[index]=v;search(next);if(count>=limit||exhausted)break;}
 }
 search(puzzle.fixed);return {count,exhausted,nodes};
}
export function regionBoundary(topology,region){return topology.edges.map((_,edge)=>topology.cells.reduce((n,edges,i)=>n+(region.has(i)&&edges.includes(edge)?1:0),0)===1?1:0);}
export function makeSlitherlink(config,random){
 const size=config.size,topology=loopTopology(size),start=Math.floor(random()*(size-1));let region=new Set([start,start+1]);
 const order=shuffleValues(Array.from({length:size*size},(_,i)=>i),random);
 for(let pass=0;pass<2;pass++)for(const index of order){if(region.has(index)||region.size>=Math.ceil(size*size*.65))continue;const r=Math.floor(index/size),c=index%size;if(![[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([rr,cc])=>rr>=0&&rr<size&&cc>=0&&cc<size&&region.has(rr*size+cc)))continue;
  const next=new Set([...region,index]),lines=regionBoundary(topology,next);if(singleLoop(topology,lines)&&topology.cells.every(edges=>edges.filter(i=>lines[i]===1).length<=3))region=next;
 }
 const solution=regionBoundary(topology,region),clues=topology.cells.map(edges=>edges.filter(i=>solution[i]===1).length),fixed=Array(solution.length).fill(-1),puzzle={size,topology,solution,clues,fixed};
 const anchors=shuffleValues(Array.from({length:solution.length},(_,i)=>i),random);let added=0;
 while(added<anchors.length){const proof=countLoopSolutions(puzzle,2,6000);if(proof.count===1&&!proof.exhausted&&added>=Math.floor(anchors.length*config.anchorRatio))break;const edge=anchors[added++];fixed[edge]=solution[edge];}
 const removable=shuffleValues(Array.from({length:clues.length},(_,i)=>i),random);let hidden=0;
 for(const index of removable){if(hidden>=Math.floor(clues.length*(config.hiddenRatio||0)))break;const previous=clues[index];clues[index]=null;const proof=countLoopSolutions(puzzle,2,500);if(proof.count===1&&!proof.exhausted)hidden++;else clues[index]=previous;}
 return puzzle;
}
export function rotateSlitherlink(puzzle,marks){const vertexCount=(puzzle.size+1)**2;const lookup=new Map(puzzle.topology.edges.map(([a,b],i)=>[`${Math.min(a,b)}:${Math.max(a,b)}`,i]));const mapping=puzzle.topology.edges.map(([a,b])=>{a=vertexCount-1-a;b=vertexCount-1-b;return lookup.get(`${Math.min(a,b)}:${Math.max(a,b)}`);});const transform=values=>{const result=Array(values.length);values.forEach((value,i)=>{result[mapping[i]]=value;});return result;};return {puzzle:{...puzzle,clues:[...puzzle.clues].reverse(),fixed:transform(puzzle.fixed),solution:transform(puzzle.solution)},marks:transform(marks)};}
