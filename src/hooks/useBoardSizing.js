import { useCallback, useEffect, useState } from 'react';
import { fitBoardCell } from '../utils/responsiveLayout.js';
export function useBoardSizing(columns, options={}) {
  const [element,setElement]=useState(null);
  const ref=useCallback(node=>setElement(node),[]);
  const [width,setWidth]=useState(()=>Math.max(240,(typeof window==='undefined'?390:window.innerWidth||390)-64));
  const [zoom,setZoom]=useState(1);
  useEffect(()=>{
    const node=element;if(!node)return;
    const measure=()=>{if(node.clientWidth>0)setWidth(node.clientWidth);};measure();
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;
    observer?.observe(node);window.addEventListener('resize',measure);
    return()=>{observer?.disconnect();window.removeEventListener('resize',measure);};
  },[element]);
  return {ref,element,zoom,setZoom,cell:fitBoardCell(width,columns,{...options,zoom})};
}
