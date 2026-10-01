import React from 'react';
function Cube({ x, y, size = 38, top = '#c5b9ff', left = '#9674ee', right = '#7050cf' }) {
  return <g transform={`translate(${x} ${y})`}><path d={`M0 0 ${size} ${-size / 2} ${size * 2} 0 ${size} ${size / 2}Z`} fill={top}/><path d={`M0 0 ${size} ${size / 2} ${size} ${size * 1.55} 0 ${size * 1.05}Z`} fill={left}/><path d={`M${size} ${size / 2} ${size * 2} 0 ${size * 2} ${size * 1.05} ${size} ${size * 1.55}Z`} fill={right}/><path d={`M0 0 ${size} ${size / 2} ${size * 2} 0M${size} ${size / 2}v${size * 1.05}`} fill="none" stroke="#ffffff" strokeOpacity=".2" strokeWidth="1.2"/></g>;
}
export function HeroArtwork() {
  return <svg viewBox="0 0 460 310" className="hero-artwork" aria-hidden="true">
    <g fill="none" stroke="#c8bcff" opacity=".13"><ellipse cx="244" cy="170" rx="166" ry="101" transform="rotate(-25 244 170)"/><ellipse cx="244" cy="170" rx="193" ry="120" transform="rotate(-25 244 170)"/><path d="M50 265 408 59M64 87l339 196" strokeDasharray="3 8"/></g>
    <g className="hero-cubes"><Cube x={143} y={189} size={40}/><Cube x={223} y={189} size={40} top="#dcd4ff" left="#bea6ff" right="#9c7bee"/><Cube x={183} y={126} size={40} top="#f0ecff" left="#b8a0fa" right="#8d68e3"/><Cube x={263} y={126} size={40} top="#b09bfc" left="#9770e5" right="#6f4eaf"/><Cube x={223} y={63} size={40} top="#e3dbff" left="#bba0fb" right="#8c67d4"/></g>
    <g transform="translate(92 58) rotate(-12)"><rect width="78" height="79" rx="17" fill="#252434" stroke="#777087" strokeOpacity=".5"/><text x="39" y="52" textAnchor="middle" fontSize="39" fontFamily="system-ui" fontWeight="700" fill="#ddd0ff">7</text><circle cx="65" cy="13" r="3" fill="#ad91ff"/></g>
    <g transform="translate(338 197) rotate(12)"><rect width="64" height="65" rx="16" fill="#e4f3c7"/><text x="32" y="44" textAnchor="middle" fontSize="34" fontFamily="system-ui" fontWeight="500" fill="#303a22">+</text></g>
    <g fill="#c2b2f4"><path d="m378 94 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/><path d="m108 224 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" opacity=".6"/><circle cx="321" cy="36" r="3"/><circle cx="77" cy="173" r="3"/></g>
    <g transform="translate(167 270)"><rect width="168" height="25" rx="12.5" fill="#272631" stroke="#5d556e" strokeOpacity=".6"/><circle cx="14" cy="12.5" r="3" fill="#c8dd99"/><text x="28" y="16.5" fontSize="9.5" fontWeight="600" fill="#dcd6e9" letterSpacing="1.2">THINK. PLAY. LEVEL UP.</text></g>
  </svg>;
}
export default function Artwork({ id, compact = false }) {
  return <svg viewBox="0 0 340 154" className={`game-artwork ${compact ? 'compact' : ''}`} aria-hidden="true">
    {id === '300' && <>
      <g stroke="#b5a2e8" strokeWidth="1" opacity=".28"><path d="M0 38h340M0 76h340M0 114h340M38 0v154M76 0v154M114 0v154M152 0v154M190 0v154M228 0v154M266 0v154M304 0v154"/></g>
      <g transform="translate(82 44) rotate(-9 26 32)"><rect width="62" height="68" rx="13" fill="#fff"/><rect y="6" width="62" height="68" rx="13" fill="#bca4f5"/><rect width="62" height="65" rx="13" fill="#fcfaff"/><text x="31" y="45" textAnchor="middle" fontSize="36" fontWeight="750" fill="#6c4ab4">8</text></g>
      <text x="169" y="89" textAnchor="middle" fontSize="31" fontWeight="400" fill="#9a79ce">+</text>
      <g transform="translate(191 38) rotate(10 31 35)"><rect y="6" width="66" height="70" rx="13" fill="#7753c5"/><rect width="66" height="67" rx="13" fill="#9870e4"/><text x="33" y="47" textAnchor="middle" fontSize="39" fontWeight="750" fill="#fff">5</text></g>
      <path d="m45 47 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm239 61 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#ad90dc"/>
    </>}
    {id === 'prime' && <>
      <circle cx="170" cy="80" r="116" fill="none" stroke="#b2ddd1"/><circle cx="170" cy="80" r="85" fill="none" stroke="#b2ddd1"/>
      <g transform="translate(99 14) rotate(-7 73 63)">{[4,7,12,11,9,13,8,5,6].map((n,i) => { const prime=[7,11,13,5].includes(n); return <g key={i} transform={`translate(${i%3*49} ${Math.floor(i/3)*43})`}><rect y="3" width="42" height="36" rx="7" fill={prime ? '#77bba6' : '#c5e3d9'}/><rect width="42" height="36" rx="7" fill={prime ? '#318c74' : '#f9fffc'}/><text x="21" y="25" textAnchor="middle" fontSize="20" fontWeight="650" fill={prime ? '#fff' : '#648a7f'}>{n}</text></g>; })}</g>
      <circle cx="283" cy="53" r="10" fill="none" stroke="#92c1b2" strokeDasharray="2 3"/>
    </>}
    {id === 'pixel' && <>
      <g transform="translate(94 25) rotate(-9 37 50)"><rect x="-13" y="-9" width="84" height="111" rx="12" fill="#f2bd9e"/><rect x="-13" y="-13" width="84" height="111" rx="12" fill="#fff8ef"/>{[0,1,2,5,8,11,12,13,14].map(n => <rect key={n} x={n%3*17} y={Math.floor(n/3)*17} width="14" height="14" rx="2" fill="#eca176"/>)}</g>
      <g transform="translate(185 30) rotate(10 30 45)"><rect x="-10" y="-6" width="76" height="105" rx="12" fill="#ce7a4c"/><rect x="-10" y="-10" width="76" height="105" rx="12" fill="#e99b6d"/>{[0,1,2,3,6,7,8,11,12,13,14].map(n => <rect key={n} x={n%3*17} y={Math.floor(n/3)*17} width="14" height="14" rx="2" fill="#fff3e5"/>)}</g>
      <path d="m54 97 6 6-6 6m225-66 6 6-6 6" stroke="#d3a489" fill="none" strokeWidth="2"/>
    </>}
    {id === 'mnm' && <>
      <g transform="translate(89 26) rotate(-8 40 44)"><rect y="5" width="70" height="91" rx="13" fill="#98b5dc"/><rect width="70" height="91" rx="13" fill="#fcfdff"/><rect x="10" y="10" width="50" height="71" rx="8" fill="#eaf0fa" stroke="#d4e0f2"/><path d="m20 35 15-9 15 9v21l-15 9-15-9Z" stroke="#7e9fce" fill="none" strokeWidth="2"/></g>
      <g transform="translate(185 30) rotate(10 36 44)"><rect y="5" width="70" height="91" rx="13" fill="#5882c1"/><rect width="70" height="91" rx="13" fill="#6a97d7"/><text x="35" y="61" fontSize="42" textAnchor="middle" fill="#fff" fontWeight="700">7</text></g>
      <path d="M151 37q15-18 33-9l-7-1m-19 94q15 16 27 5" fill="none" stroke="#7699ca" strokeWidth="2"/><circle cx="51" cy="52" r="4" fill="#a3bddd"/>
    </>}
    {id === 'cube' && <>
      <ellipse cx="180" cy="133" rx="96" ry="13" fill="#d9b867" opacity=".14"/>
      <Cube x={92} y={74} size={28} top="#fae6a8" left="#e4bf62" right="#c99937"/><Cube x={148} y={74} size={28} top="#fff5d2" left="#efd284" right="#d6ac4c"/><Cube x={204} y={74} size={28} top="#f9e4a4" left="#edc96e" right="#d5a343"/><Cube x={120} y={31} size={28} top="#fff4ce" left="#efd488" right="#d6aa48"/><Cube x={176} y={31} size={28} top="#fff8e3" left="#f7dfa1" right="#e3bd68"/>
      <path d="m279 43 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#d7b66d"/>
    </>}
    {id === 'rps' && <>
      <g transform="translate(93 37) rotate(-14 36 38)"><rect y="5" width="76" height="77" rx="18" fill="#c8819b"/><rect width="76" height="77" rx="18" fill="#fff4f8"/>{[[21,21],[55,21],[38,39],[21,56],[55,56]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="#cf7f9b"/>)}</g>
      <g transform="translate(190 40) rotate(15 34 34)"><rect y="5" width="67" height="69" rx="17" fill="#a05273"/><rect width="67" height="69" rx="17" fill="#c17294"/>{[[19,19],[48,49],[34,34]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="#fff5f9"/>)}</g>
      <path d="M71 109h-9m222-67h9M272 115l7 7" stroke="#d9a9bd" strokeWidth="3"/>
    </>}
    {id === 'sudoku' && <>
      <g transform="translate(111 13) rotate(-7 61 62)"><rect y="5" width="122" height="125" rx="12" fill="#b09cdb"/><rect width="122" height="125" rx="12" fill="#fbf8ff"/>{Array.from({length:16},(_,i)=><g key={i}><rect x={10+i%4*27} y={10+Math.floor(i/4)*27} width="23" height="23" rx="4" fill={i%3===0 ? '#9a7bce' : '#ede5f7'}/><text x={21+i%4*27} y={27+Math.floor(i/4)*27} fontSize="15" fontWeight="600" textAnchor="middle" fill={i%3===0 ? 'white' : '#88729f'}>{i%5===0 ? '?' : [1,3,4,2][(i+Math.floor(i/4))%4]}</text></g>)}</g>
      <circle cx="73" cy="83" r="19" fill="none" stroke="#c8b6e3" strokeDasharray="4 4"/><path d="m267 39 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#bfa9dd"/>
    </>}
    {id === 'minesweeper' && <>
      <g transform="translate(92 22) rotate(-5 76 57)">
        <rect x="-8" y="-8" width="168" height="130" rx="15" fill="#9bcdbf" opacity=".5"/>
        <rect width="152" height="114" rx="13" fill="#f8fffc" stroke="#b8dcd1"/>
        {Array.from({length:24},(_,i)=>{ const open=[1,2,6,7,8,12,13,14,18,19].includes(i); const n={1:1,2:1,6:1,7:2,8:2,12:0,13:1,14:2,18:0,19:1}[i]; return <g key={i} transform={`translate(${9+(i%6)*23} ${9+Math.floor(i/6)*24})`}><rect width="19" height="19" rx="4" fill={open?'#ffffff':'#dceee8'} stroke="#c8e2da"/><text x="9.5" y="14" textAnchor="middle" fontSize="11" fontWeight="750" fill={n===2?'#3f8d73':'#5e7fb2'}>{n || ''}</text></g>;})}
      </g>
      <g transform="translate(236 87)"><circle cx="0" cy="0" r="22" fill="#2f7362"/><circle cx="-7" cy="-7" r="4" fill="#f3fbf8" opacity=".65"/><path d="M0-34v10M0 24v10M-34 0h10M24 0h10M-24-24l7 7M17 17l7 7M-24 24l7-7M17-17l7-7" stroke="#2f7362" strokeWidth="5" strokeLinecap="round"/></g>
      <path d="M63 46h18m179-10 5 8 9 2-7 6 1 9-8-4-8 4 1-9-7-6 9-2Z" fill="none" stroke="#78b9a7" strokeWidth="2"/>
    </>}
    {id === 'maze' && <>
      <g transform="translate(80 15) rotate(-4 92 62)">
        <rect x="-7" y="-7" width="198" height="139" rx="16" fill="#c8d9f2" opacity=".52"/>
        <rect width="184" height="125" rx="13" fill="#fbfdff" stroke="#c8d8ed"/>
        <path d="M14 14h58v20H36v23h46v-17h38v38H91v30H54V78H14Zm106 0h49v42h-24v24h24v29h-52V91h17V68h-31V34h17Z" fill="none" stroke="#6f8fbf" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter"/>
        <circle cx="25" cy="24" r="8" fill="#7b5ac2"/><path d="m151 95 7 7 13-15" fill="none" stroke="#6da06a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <path d="M55 112h22m191-80 4 7 8 2-6 6 1 8-7-4-7 4 1-8-6-6 8-2Z" fill="none" stroke="#8ea9cf" strokeWidth="2"/>
    </>}
    {id === 'matrix' && <>
      <g transform="translate(96 20) rotate(-6 72 58)">
        <rect x="-8" y="-8" width="160" height="132" rx="17" fill="#cfbfe9" opacity=".45"/>
        <rect width="144" height="116" rx="14" fill="#fbf9ff" stroke="#d9ccec"/>
        {Array.from({length:20},(_,i)=>{ const active=[1,4,6,8,12,13,17].includes(i); return <rect key={i} x={12+(i%5)*24} y={10+Math.floor(i/5)*24} width="18" height="18" rx="5" fill={active?'#8d69c7':'#ece5f5'} stroke={active?'#7a59b2':'#ddd3e9'}/>; })}
      </g>
      <g transform="translate(236 46)"><circle r="31" fill="#f3eef9" stroke="#d4c4e7"/><path d="M-12 1h24M0-11v24" stroke="#9b7cc1" strokeWidth="4" strokeLinecap="round"/><circle cx="0" cy="0" r="5" fill="#7f5ab3"/></g>
      <path d="m64 49 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm219 64 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#b29acb"/>
    </>}
    {id === 'nonogram' && <>
      <g transform="translate(92 18) rotate(-5 74 58)"><rect x="-8" y="-8" width="164" height="132" rx="16" fill="#f4cdb4" opacity=".45"/><rect width="148" height="116" rx="13" fill="#fffaf6" stroke="#efc7aa"/>{Array.from({length:25},(_,i)=>{const on=[1,5,6,7,8,9,11,13,15,16,17,18,19,21,23].includes(i);return <rect key={i} x={13+(i%5)*24} y={10+Math.floor(i/5)*20} width="17" height="17" rx="3" fill={on?'#b66f49':'#f5e6dc'} stroke="#e8c9b6"/>;})}</g><g fill="#a46242" fontSize="11" fontWeight="700"><text x="72" y="48">3</text><text x="72" y="70">1 1</text><text x="72" y="92">5</text></g>
    </>}
    {id === 'game2048' && <>
      <g transform="translate(90 18) rotate(4 74 58)"><rect x="-8" y="-8" width="164" height="132" rx="16" fill="#f1dda2" opacity=".5"/><rect width="148" height="116" rx="13" fill="#fffaf0" stroke="#ead79d"/>{[2,4,8,16,32,64,128,256,4,8,16,32,2,4,8,16].map((n,i)=><g key={i} transform={`translate(${12+(i%4)*31} ${10+Math.floor(i/4)*25})`}><rect width="26" height="20" rx="5" fill={n>=128?'#9a772b':n>=32?'#c6a24f':'#eadcae'}/><text x="13" y="14" textAnchor="middle" fontSize={n>=100?7:9} fontWeight="800" fill={n>=32?'#fff':'#6f623f'}>{n}</text></g>)}</g><path d="m274 45 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#c6a24f"/>
    </>}
  </svg>;
}
