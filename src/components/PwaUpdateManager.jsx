import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PwaUpdateManager() {
  const { lang }=useLanguage();
  const [waiting,setWaiting]=useState(null);
  const [dismissed,setDismissed]=useState(false);
  const [updating,setUpdating]=useState(false);
  const reloaded=useRef(false);
  const copy=(id,en)=>lang==='en'?en:id;

  useEffect(()=>{
    if (!('serviceWorker' in navigator)) return undefined;
    let active=true; let timer=null;
    const inspect=registration=>{
      if (!active || !registration) return;
      if (registration.waiting) setWaiting(registration.waiting);
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange',()=>{
          if (worker.state==='installed' && navigator.serviceWorker.controller) {
            setDismissed(false);
            setWaiting(registration.waiting||worker);
          }
        });
      });
      const poll=()=>{ if(navigator.onLine) registration.update().catch(()=>{}); };
      timer=setInterval(poll,30*60*1000);
      window.addEventListener('online',poll);
      registration.__baPoll=poll;
    };
    let registrationRef=null;
    navigator.serviceWorker.getRegistration().then(reg=>{registrationRef=reg;inspect(reg);}).catch(()=>{});
    return()=>{
      active=false;
      if(timer)clearInterval(timer);
      if(registrationRef?.__baPoll)window.removeEventListener('online',registrationRef.__baPoll);
    };
  },[]);

  useEffect(()=>{
    if (!updating) return undefined;
    const reload=()=>{
      if(reloaded.current)return;
      reloaded.current=true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange',reload);
    const fallback=setTimeout(reload,8000);
    return()=>{clearTimeout(fallback);navigator.serviceWorker.removeEventListener('controllerchange',reload);};
  },[updating]);

  if (!waiting || dismissed) return null;
  const update=()=>{
    if(updating)return;
    setUpdating(true);
    waiting.postMessage({type:'SKIP_WAITING'});
  };
  return <aside className="pwa-update-banner" role="status" aria-live="polite">
    <span className="pwa-update-icon"><Icon name="download" size={18}/></span>
    <div><small>{copy('UPDATE TERSEDIA','UPDATE AVAILABLE')}</small><strong>{copy('Brain Arena versi baru siap dipakai.','A new Brain Arena version is ready.')}</strong><p>{copy('v1.18 memuat update secara aman dan mempertahankan progres lokal.','v1.18 applies updates safely while preserving local progress.')}</p></div>
    <div className="pwa-update-actions"><button type="button" className="ba-button outline" onClick={()=>setDismissed(true)} disabled={updating}>{copy('Nanti','Later')}</button><button type="button" className="ba-button primary" onClick={update} disabled={updating}>{updating?copy('Memperbarui...','Updating...'):copy('Update sekarang','Update now')}</button></div>
  </aside>;
}
