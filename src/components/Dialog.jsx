import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
// Native modal: focus trap, Escape handling and background inertness.
export default function Dialog({ open, onClose, title, children, className = '' }) {
  const ref = useRef(null); const titleId = useId(); const { lang } = useLanguage();
  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    node.showModal(); document.body.style.overflow = 'hidden';
    return () => { node.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, [open]);
  if (!open) return null;
  return createPortal(<dialog ref={ref} className={`ba-dialog ${className}`} aria-labelledby={titleId} onKeyDown={e => e.stopPropagation()} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="dialog-header"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label={lang === 'id' ? 'Tutup dialog' : 'Close dialog'}><Icon name="close"/></button></div>
    {children}
  </dialog>, document.body);
}
