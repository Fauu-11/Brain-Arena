import React from 'react';

// Original scalable outline artwork, redrawn to follow the uploaded reference:
// open palm, raised fist, and two fingers. No platform-dependent emoji/font.
const PATHS = {
  rock: [
    'M23 58V44C15 41 11 34 13 27C14 23 16 21 19 19',
    'M19 31V10C19 4 27 4 28 10V13C30 8 36 11 36 16C40 12 45 16 44 20C49 17 53 21 53 26V33C53 38 50 42 45 44V58',
  ],
  paper: [
    'M21 31V13C21 7 29 7 29 13V28V9C29 3 37 3 37 9V28V13C37 7 45 7 45 13V29V21C45 15 53 15 53 21V36C53 49 47 57 36 57C28 57 22 54 17 49L7 39C3 35 8 29 12 32L21 39V31',
  ],
  scissors: [
    'M22 31V11C22 4 30 4 30 11V29L37 9C39 3 47 5 45 12L38 38',
    'M23 31C19 25 13 29 14 34C8 31 6 36 6 41V47C6 54 11 58 20 58H32C42 58 50 51 50 43C50 37 46 33 42 32',
  ],
};
export default function RPSHand({ shape, size = 30, label, rotation = 0, className = '' }) {
  const paths = PATHS[shape] || PATHS.rock;
  return <svg className={`rps-hand ${className}`} data-rps-icon={shape} viewBox="0 0 64 64" width={size} height={size}
    fill="none" stroke="currentColor" strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
    {paths.map((d, i) => <path key={i} d={d}/>)}</svg>;
}
