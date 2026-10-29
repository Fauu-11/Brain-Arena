import React from 'react';
import Icon from './Icon.jsx';
export default function BoardZoom({value,onChange,lang='id'}) {
  const en=lang==='en';
  const change=delta=>onChange(Math.max(.75,Math.min(1.75,Math.round((value+delta)*100)/100)));
  return <div className="board-zoom" role="group" aria-label={en?'Board zoom':'Zoom papan'}>
    <span><Icon name="grid" size={15}/>{en?'Board size':'Ukuran papan'}</span>
    <div><button type="button" onClick={()=>change(-.25)} disabled={value<=.75} aria-label={en?'Zoom out board':'Perkecil papan'}>−</button><button type="button" className="board-zoom-reset" onClick={()=>onChange(1)} aria-label={en?'Reset board zoom':'Reset zoom papan'}>{Math.round(value*100)}%</button><button type="button" onClick={()=>change(.25)} disabled={value>=1.75} aria-label={en?'Zoom in board':'Perbesar papan'}>+</button></div>
  </div>;
}
