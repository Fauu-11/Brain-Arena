import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import Icon from './Icon.jsx';

export default function PwaInstallButton({ compact=false }) {
  const { lang } = useLanguage();
  const { setNotice } = useArena();
  const [promptEvent,setPromptEvent] = useState(null);
  const [installed,setInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true);
  const copy=(id,en)=>lang==='id'?id:en;
  useEffect(()=>{
    const before = event => { event.preventDefault(); setPromptEvent(event); };
    const done = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener('beforeinstallprompt',before);
    window.addEventListener('appinstalled',done);
    return()=>{ window.removeEventListener('beforeinstallprompt',before); window.removeEventListener('appinstalled',done); };
  },[]);
  if (installed) return compact ? null : <span className="pwa-installed"><Icon name="check" size={13}/>{copy('Terpasang','Installed')}</span>;
  const install = async () => {
    if (!promptEvent) { setNotice(copy('Gunakan menu browser → Install app / Add to Home Screen.','Use your browser menu → Install app / Add to Home Screen.')); return; }
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result?.outcome === 'accepted') setNotice(copy('Brain Arena sedang dipasang.','Brain Arena is being installed.'));
    setPromptEvent(null);
  };
  return <button className={compact?'icon-button pwa-install-compact':'ba-button outline pwa-install-button'} onClick={install} title={copy('Pasang Brain Arena','Install Brain Arena')} aria-label={copy('Pasang Brain Arena sebagai aplikasi','Install Brain Arena as an app')}><Icon name="download" size={compact?17:15}/>{!compact&&copy('Install aplikasi','Install app')}</button>;
}
