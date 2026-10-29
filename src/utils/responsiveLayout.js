export function fitBoardCell(width, columns, {gap=0, gutter=0, min=24, max=52, zoom=1}={}) {
  const available=Math.max(0,Number(width)||0)-gutter;
  const count=Math.max(1,Math.floor(Number(columns)||1));
  const fit=Math.floor((available-(count-1)*gap)/count);
  return Math.max(min,Math.min(max,fit))*zoom;
}
