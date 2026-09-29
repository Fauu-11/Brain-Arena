import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import Dialog from './Dialog.jsx';
export default function RulesModal({ isOpen, onClose, ruleList = [], gameName }) {
  const { lang } = useLanguage();
  return <Dialog open={isOpen} onClose={onClose} title={`${gameName} - ${lang === 'en' ? 'Rules' : 'Aturan'}`} className="rules-dialog"><ol className="rule-list">{ruleList.map((rule,index)=><li key={index}><span>{String(index+1).padStart(2,'0')}</span><div>{rule}</div></li>)}</ol><button className="ba-button primary full-width" onClick={onClose}>{lang==='en'?'Got it, back to game':'Mengerti, kembali ke game'}</button></Dialog>;
}
