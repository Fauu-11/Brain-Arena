import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { simulateCloudMigration } from '../utils/cloudReadiness.js';
import { downloadSupabaseMigrationPackage } from '../utils/supabaseMigration.js';
import { getOrCreateGuestIdentity } from '../utils/guestIdentity.js';
import { getFeatureFlags } from '../utils/featureFlags.js';

export default function CloudReadiness(){
  const {lang}=useLanguage();const copy=(id,en)=>lang==='id'?id:en;
  const [report,setReport]=useState(null);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');
  const identity=getOrCreateGuestIdentity();const flags=getFeatureFlags();
  const scan=async()=>{setBusy(true);try{setReport(await simulateCloudMigration());}finally{setBusy(false);}};
  useEffect(()=>{scan();},[]);
  const exportMigration=()=>{try{downloadSupabaseMigrationPackage();setNotice(copy('Paket migrasi v2.0 berhasil dibuat.','v2.0 migration package created.'));setTimeout(()=>setNotice(''),2200);}catch{setNotice(copy('Paket migrasi tidak dapat dibuat.','Migration package could not be created.'));}};
  return <div className="meta-page cloud-readiness-page"><div className="page-heading"><div><span className="eyebrow">SUPABASE READINESS</span><h1>{copy('Siapkan data lokal sebelum Brain Arena v2.0.','Prepare local data before Brain Arena v2.0.')}</h1><p className="page-intro">{copy('v1.19 menyiapkan IndexedDB, repository, UUID guest, antrean sinkronisasi, mutation journal, serta format migrasi Supabase tanpa mengaktifkan cloud lebih dulu.','v1.19 prepares IndexedDB, repositories, guest UUID, sync queue, mutation journal, and a Supabase migration format without enabling cloud yet.')}</p></div><button className="ba-button outline" onClick={scan} disabled={busy}><Icon name="refresh" size={14}/>{busy?copy('Memeriksa...','Scanning...'):copy('Scan ulang','Rescan')}</button></div>
    <section className="cloud-readiness-hero"><div className="cloud-score"><span>{report?.percent??0}%</span><small>{copy('CLOUD READINESS','CLOUD READINESS')}</small></div><div><small>{copy('IDENTITAS GUEST','GUEST IDENTITY')}</small><code>{identity.id}</code><p>{copy('UUID ini menjadi jangkar migrasi progress lokal ke akun Supabase saat v2.0 tersedia.','This UUID becomes the anchor for migrating local progress to a Supabase account when v2.0 arrives.')}</p></div><button className="ba-button primary" onClick={exportMigration}><Icon name="download" size={15}/>{copy('Export untuk v2.0','Export for v2.0')}</button></section>
    {notice&&<div className="cloud-inline-notice" role="status"><Icon name="check" size={15}/>{notice}</div>}
    <div className="cloud-readiness-grid">{(report?.checks||[]).map(item=><article key={item.id} className={item.ok?'is-ok':'is-warning'}><span><Icon name={item.ok?'check':'activity'} size={16}/></span><div><small>{item.label}</small><strong>{item.ok?copy('Siap','Ready'):copy('Perlu perhatian','Needs attention')}</strong><p>{item.detail}</p></div></article>)}</div>
    <section className="cloud-foundation-panel"><header><div><small>FEATURE FLAGS</small><h2>{copy('Cloud tetap terkunci sampai v2.0.','Cloud stays locked until v2.0.')}</h2></div><span className="cloud-local-badge">LOCAL-FIRST</span></header><div className="cloud-flag-grid">{Object.entries(flags).map(([key,value])=><div key={key}><span>{key}</span><strong className={value?'on':'off'}>{value?'ON':'OFF'}</strong></div>)}</div><p>{copy('Flag online sengaja OFF. v1.19 hanya menyiapkan arsitektur dan paket migrasi; tidak ada data yang dikirim ke server atau Supabase.','Online flags intentionally stay OFF. v1.19 only prepares architecture and migration packages; no data is sent to a server or Supabase.')}</p></section>
  </div>;
}
