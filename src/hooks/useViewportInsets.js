import { useEffect } from 'react';
export function useViewportInsets() {
  useEffect(()=>{
    const viewport=window.visualViewport;const root=document.documentElement;
    const update=()=>{
      const height=viewport?.height||window.innerHeight;
      const editable=document.activeElement?.matches?.('input:not([type="checkbox"]):not([type="range"]),textarea,select,[contenteditable="true"]');
      const keyboard=Boolean(editable&&window.innerHeight-height>120);
      root.style.setProperty('--visual-height',`${height}px`);
      root.dataset.keyboardOpen=String(keyboard);
    };
    update();viewport?.addEventListener('resize',update);window.addEventListener('resize',update);
    document.addEventListener('focusin',update);document.addEventListener('focusout',update);
    return()=>{viewport?.removeEventListener('resize',update);window.removeEventListener('resize',update);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);delete root.dataset.keyboardOpen;root.style.removeProperty('--visual-height');};
  },[]);
}
