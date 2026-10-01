import React, { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { GAMES, gameById } from '../data/games.js';
import { useArena } from '../context/ArenaContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FEEDBACK_TYPES, cleanFeedback, sendFeedback } from '../utils/feedback.js';
import { readJSON, writeJSON } from '../utils/storage.js';
import { buildDiagnostics } from '../utils/diagnostics.js';

const RECEIPT_KEY = 'ba_feedback_receipts_v1';
const MAX_RECEIPTS = 8;
const APP_VERSION = '1.18.0';

function loadReceipts() {
  const value = readJSON(RECEIPT_KEY, []);
  return Array.isArray(value) ? value.filter(item => item && Number.isFinite(item.time)).slice(0, MAX_RECEIPTS) : [];
}

export default function Feedback() {
  const { lang } = useLanguage();
  const { profile, setNotice, currentSession } = useArena();
  const copy = (id,en) => lang === 'id' ? id : en;
  const [form,setForm] = useState({
    type:'suggestion', gameId:'general', rating:5, subject:'', message:'',
    playerName:profile.name || '', playerEmail:'', includeDiagnostics:true, honey:'',
  });
  const [status,setStatus] = useState('idle');
  const [error,setError] = useState('');
  const [receipts,setReceipts] = useState(loadReceipts);
  const selectedGame = useMemo(() => gameById(form.gameId), [form.gameId]);
  const set = (key,value) => setForm(current => ({ ...current, [key]:value }));

  const errorText = code => ({
    subject:copy('Subjek minimal 4 karakter.','Subject must be at least 4 characters.'),
    message:copy('Ceritakan masukan sedikit lebih lengkap, minimal 15 karakter.','Please describe your feedback in at least 15 characters.'),
    email:copy('Format email balasan belum valid.','The reply email format is not valid.'),
    spam:copy('Pengiriman tidak dapat diproses.','The submission could not be processed.'),
  }[code] || copy('Masukan belum dapat dikirim. Periksa koneksi lalu coba lagi.','Feedback could not be sent. Check your connection and try again.'));

  const submit = async event => {
    event.preventDefault();
    if (status === 'sending') return;
    setError(''); setStatus('sending');
    const cleaned = cleanFeedback(form);
    const context = {
      version:`Brain Arena v${APP_VERSION}`,
      route:window.location.hash || '#/feedback',
      gameTitle:selectedGame?.title?.[lang] || copy('Umum / Brain Arena','General / Brain Arena'),
      localTime:new Date().toLocaleString(lang === 'id' ? 'id-ID' : 'en-US'),
      diagnostics:buildDiagnostics({gameId:cleaned.gameId,session:currentSession,version:APP_VERSION}),
    };
    try {
      const result = await sendFeedback(cleaned, context);
      if (!result.ok) {
        setStatus('error'); setError(errorText(result.validation || result.error)); return;
      }
      const receipt = { time:Date.now(), type:cleaned.type, gameId:cleaned.gameId, subject:cleaned.subject, rating:cleaned.rating };
      const next=[receipt,...receipts].slice(0,MAX_RECEIPTS);
      setReceipts(next); writeJSON(RECEIPT_KEY,next);
      setForm(current => ({ ...current, subject:'', message:'', playerEmail:'', rating:5, honey:'' }));
      setStatus('success');
      setNotice(copy('Feedback berhasil dikirim ke developer','Feedback sent to the developer'));
    } catch {
      setStatus('error'); setError(errorText('network'));
    }
  };

  const typeLabel = id => FEEDBACK_TYPES.find(item => item.id===id)?.label?.[lang] || id;
  return <div className="meta-page feedback-page">
    <section className="feedback-hero">
      <div><span className="section-eyebrow"><Icon name="message" size={15}/>{copy('SUARA PEMAIN','PLAYER VOICE')}</span><h1>{copy('Feedback & Saran','Feedback & Suggestions')}</h1><p>{copy('Bantu Brain Arena menjadi lebih seru, lebih jelas, dan lebih nyaman dimainkan. Masukanmu diteruskan langsung ke developer tanpa menampilkan alamat email developer di halaman.','Help make Brain Arena more fun, clearer, and easier to play. Your message is forwarded directly to the developer without displaying the developer email address on this page.')}</p></div>
      <div className="feedback-hero-mark"><Icon name="message" size={42}/><strong>{copy('Kami membaca masukan pemain.','Player feedback matters.')}</strong><small>{copy('Bug, ide fitur, gameplay, UI/UX, dan panduan.','Bugs, feature ideas, gameplay, UI/UX, and guides.')}</small></div>
    </section>

    <div className="feedback-layout">
      <form className="feedback-form" onSubmit={submit} noValidate>
        <div className="feedback-form-head"><span><Icon name="send" size={20}/></span><div><h2>{copy('Kirim masukan','Send feedback')}</h2><p>{copy('Tidak perlu membagikan data sensitif. Email pemain hanya opsional jika ingin mendapat balasan.','Do not include sensitive information. Your email is optional and only needed if you want a reply.')}</p></div></div>

        <div className="feedback-fields two-col">
          <label><span>{copy('Jenis masukan','Feedback type')}</span><select value={form.type} onChange={e=>set('type',e.target.value)}>{FEEDBACK_TYPES.map(item=><option key={item.id} value={item.id}>{item.label[lang]}</option>)}</select></label>
          <label><span>{copy('Game / area','Game / area')}</span><select value={form.gameId} onChange={e=>set('gameId',e.target.value)}><option value="general">{copy('Umum / Brain Arena','General / Brain Arena')}</option>{GAMES.map(game=><option key={game.id} value={game.id}>{game.title[lang]}</option>)}</select></label>
        </div>

        <fieldset className="feedback-rating"><legend>{copy('Rating pengalaman','Experience rating')}</legend><div>{[1,2,3,4,5].map(value=><button type="button" key={value} className={form.rating===value?'active':''} onClick={()=>set('rating',value)} aria-label={`${value} ${copy('bintang','stars')}`} aria-pressed={form.rating===value}><Icon name="star" size={18} filled={form.rating>=value}/><span>{value}</span></button>)}</div></fieldset>

        <label className="feedback-field"><span>{copy('Subjek','Subject')}</span><input value={form.subject} onChange={e=>set('subject',e.target.value)} maxLength={120} placeholder={copy('Contoh: Maze Impossible terlalu padat di layar HP','Example: Impossible Maze feels too dense on mobile')} required/><small>{form.subject.length}/120</small></label>
        <label className="feedback-field"><span>{copy('Ceritakan masukanmu','Tell us what you think')}</span><textarea value={form.message} onChange={e=>set('message',e.target.value)} maxLength={3000} rows={8} placeholder={copy('Jelaskan apa yang terjadi, apa yang kamu harapkan, atau ide yang ingin ditambahkan...','Describe what happened, what you expected, or an idea you would like to see...')} required/><small>{form.message.length}/3000</small></label>

        <div className="feedback-fields two-col">
          <label><span>{copy('Nama pemain','Player name')}</span><input value={form.playerName} onChange={e=>set('playerName',e.target.value)} maxLength={60} placeholder={copy('Boleh anonim','Anonymous is fine')}/></label>
          <label><span>{copy('Email untuk balasan (opsional)','Reply email (optional)')}</span><input type="email" value={form.playerEmail} onChange={e=>set('playerEmail',e.target.value)} maxLength={160} placeholder={copy('Isi hanya jika ingin dibalas','Only enter this if you want a reply')}/></label>
        </div>

        <input className="feedback-honey" tabIndex={-1} autoComplete="off" value={form.honey} onChange={e=>set('honey',e.target.value)} aria-hidden="true" name="company_website"/>
        <label className="feedback-diagnostic"><input type="checkbox" checked={form.includeDiagnostics} onChange={e=>set('includeDiagnostics',e.target.checked)}/><span><strong>{copy('Sertakan info teknis ringan','Include basic technical info')}</strong><small>{copy('Versi Brain Arena, layar, browser, PWA, seed, mode, difficulty, dan maksimal 20 aksi terakhir. Tidak menyertakan password atau isi penyimpanan lokal.','Brain Arena version, screen, browser, PWA state, seed, mode, difficulty, and up to 20 recent actions. Passwords and local storage contents are not included.')}</small></span></label>

        {error&&<div className="feedback-alert error" role="alert"><Icon name="help" size={18}/><span>{error}</span></div>}
        {status==='success'&&<div className="feedback-alert success" role="status"><Icon name="check" size={18}/><span>{copy('Terima kasih. Masukanmu sudah masuk ke saluran developer.','Thank you. Your feedback has been sent to the developer channel.')}</span></div>}

        <div className="feedback-submit"><button className="ba-button primary" disabled={status==='sending'} type="submit"><Icon name="send" size={16}/>{status==='sending'?copy('Mengirim...','Sending...'):copy('Kirim ke developer','Send to developer')}</button><span><Icon name="shield" size={14}/>{copy('Alamat developer tidak ditampilkan di antarmuka.','The developer address is not shown in the interface.')}</span></div>
      </form>

      <aside className="feedback-side">
        <section><span className="feedback-side-icon"><Icon name="spark" size={20}/></span><h2>{copy('Masukan yang paling membantu','What makes useful feedback')}</h2><ol><li>{copy('Sebutkan game atau halaman yang terkait.','Name the game or page involved.')}</li><li>{copy('Jelaskan langkah sebelum masalah terjadi.','Describe what you did before the issue happened.')}</li><li>{copy('Tulis hasil yang terjadi dan hasil yang kamu harapkan.','Explain what happened and what you expected.')}</li><li>{copy('Untuk ide fitur, jelaskan manfaatnya bagi pemain.','For feature ideas, explain how players would benefit.')}</li></ol></section>
        <section className="feedback-privacy"><Icon name="shield" size={22}/><div><h3>{copy('Privasi pemain','Player privacy')}</h3><p>{copy('Form dikirim melalui layanan relay formulir pihak ketiga ke developer. Jangan mengirim password, token, nomor identitas, atau informasi sensitif lainnya.','This form is sent through a third-party form relay to the developer. Do not send passwords, tokens, identity numbers, or other sensitive information.')}</p></div></section>
        <section className="feedback-receipts"><div className="feedback-side-title"><h3>{copy('Terakhir dikirim dari perangkat ini','Recently sent from this device')}</h3><span>{receipts.length}</span></div>{receipts.length?receipts.slice(0,5).map((item,index)=><div className="feedback-receipt" key={`${item.time}-${index}`}><span><Icon name={item.type==='bug'?'help':'message'} size={15}/></span><div><strong>{item.subject}</strong><small>{typeLabel(item.type)}{item.gameId!=='general'&&gameById(item.gameId)?` · ${gameById(item.gameId).title[lang]}`:''} · {item.rating}/5</small><time>{new Date(item.time).toLocaleString(lang==='id'?'id-ID':'en-US')}</time></div></div>):<p className="feedback-empty">{copy('Belum ada feedback yang dikirim dari browser ini.','No feedback has been sent from this browser yet.')}</p>}</section>
      </aside>
    </div>
  </div>;
}
