import React, { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PwaUpdateManager() {
  const { lang }=useLanguage();
  const [waiting,setWaiting]=useState(null);
  const [dismissed,setDismissed]=useState(false);
  const [updating,setUpdating]=useState(false);
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
          if (worker.state==='installed' && navigator.serviceWorker.controller) setWaiting(registration.waiting||worker);
        });
      });
      timer=setInterval(()=>registration.update().catch(()=>{}),30*60*1000);
    };
    navigator.serviceWorker.getRegistration().then(inspect).catch(()=>{});
    return()=>{active=false;if(timer)clearInterval(timer);};
  },[]);

  useEffect(()=>{
    if (!updating) return undefined;
    const reload=()=>window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange',reload,{once:true});
    return()=>navigator.serviceWorker.removeEventListener('controllerchange',reload);
  },[updating]);

  if (!waiting || dismissed) return null;
  const update=()=>{setUpdating(true);waiting.postMessage({type:'SKIP_WAITING'});};
  return <aside className="pwa-update-banner" role="status" aria-live="polite">
    <span className="pwa-update-icon"><Icon name="download" size={18}/></span>
    <div><small>{copy('UPDATE TERSEDIA','UPDATE AVAILABLE')}</small><strong>{copy('Brain Arena versi baru siap dipakai.','A new Brain Arena version is ready.')}</strong><p>{copy('Update akan memuat ulang aplikasi tanpa menghapus progres lokal.','Updating reloads the app without deleting local progress.')}</p></div>
    <div className="pwa-update-actions"><button type="button" className="ba-button outline" onClick={()=>setDismissed(true)}>{copy('Nanti','Later')}</button><button type="button" className="ba-button primary" onClick={update} disabled={updating}>{updating?copy('Memperbarui...','Updating...'):copy('Update sekarang','Update now')}</button></div>
  </aside>;
}
