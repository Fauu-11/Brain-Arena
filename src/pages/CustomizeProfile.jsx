import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { AVATARS, PROFILE_BANNERS, PROFILE_FRAMES, PROFILE_TITLES, customizationUnlocked, unlockText } from '../data/customization.js';
import Icon from '../components/Icon.jsx';

function OptionCard({item,type,selected,onSelect,ctx,lang}) {
  const unlocked=customizationUnlocked(item,ctx);
  const icon=type==='avatar'?item.icon:type==='frame'?'user':type==='title'?'medal':'grid';
  return <button className={`custom-option ${selected?'selected':''} ${unlocked?'':'locked'}`} disabled={!unlocked} onClick={()=>onSelect(type,item.id)} aria-pressed={selected}>
    <span className={`custom-preview ${type==='frame'?`frame-${item.id}`:''} ${type==='banner'?`banner-${item.id}`:''}`}><Icon name={icon} size={20}/></span><span><strong>{item.title[lang]}</strong><small>{unlocked?(selected?(lang==='id'?'Sedang digunakan':'Equipped'):(lang==='id'?'Tersedia':'Available')):unlockText(item,lang)}</small></span>{selected?<Icon name="check" size={15}/>:!unlocked?<Icon name="shield" size={14}/>:null}
  </button>;
}

export default function CustomizeProfile({ onNavigate }) {
  const {lang}=useLanguage();
  const {profile,levelInfo,rankInfo,achievements,daily,customization,updateCustomization,selectedBadge}=useArena();
  const copy=(id,en)=>lang==='id'?id:en;
  const ctx={profile,levelInfo,rankInfo,achievements,daily};
  const avatar=AVATARS.find(item=>item.id===customization.avatar)||AVATARS[0];
  const title=PROFILE_TITLES.find(item=>item.id===customization.title)||PROFILE_TITLES[0];
  return <div className="progression-page customize-page">
    <section className={`profile-custom-hero banner-${customization.banner}`}><div className={`profile-custom-avatar frame-${customization.frame}`}><Icon name={avatar.icon} size={35}/>{selectedBadge&&<i><Icon name={selectedBadge.icon} size={12}/></i>}</div><div><span className="eyebrow">{copy('PROFILE CUSTOMIZATION','PROFILE CUSTOMIZATION')}</span><h1>{profile.name||copy('Pemain Lokal','Local Player')}</h1><p>{title.title[lang]} · {rankInfo.tier.title[lang]} · Lv. {levelInfo.level}</p></div><button className="ba-button outline" onClick={()=>onNavigate('profile')}>{copy('Lihat profil','View profile')}<Icon name="arrow" size={14}/></button></section>

    <section className="custom-section"><div className="section-heading"><div><h2>{copy('Pilih avatar','Choose an avatar')}</h2><p>{copy('Avatar baru terbuka lewat level, rank, badge, atau progres game.','New avatars unlock through levels, ranks, badges, or game progress.')}</p></div><span className="custom-count">{AVATARS.filter(item=>customizationUnlocked(item,ctx)).length}/{AVATARS.length}</span></div><div className="custom-grid avatar-grid">{AVATARS.map(item=><OptionCard key={item.id} item={item} type="avatar" selected={customization.avatar===item.id} onSelect={updateCustomization} ctx={ctx} lang={lang}/>)}</div></section>

    <section className="custom-section"><div className="section-heading"><div><h2>{copy('Bingkai profil','Profile frame')}</h2><p>{copy('Beri avatar tampilan yang mencerminkan progres rank-mu.','Give your avatar a frame that reflects your rank progress.')}</p></div></div><div className="custom-grid">{PROFILE_FRAMES.map(item=><OptionCard key={item.id} item={item} type="frame" selected={customization.frame===item.id} onSelect={updateCustomization} ctx={ctx} lang={lang}/>)}</div></section>

    <section className="custom-section"><div className="section-heading"><div><h2>{copy('Gelar pemain','Player title')}</h2><p>{copy('Gelar tampil di halaman profil sebagai identitas progresmu.','Your title appears on the profile page as part of your progression identity.')}</p></div></div><div className="custom-grid">{PROFILE_TITLES.map(item=><OptionCard key={item.id} item={item} type="title" selected={customization.title===item.id} onSelect={updateCustomization} ctx={ctx} lang={lang}/>)}</div></section>

    <section className="custom-section"><div className="section-heading"><div><h2>{copy('Banner profil','Profile banner')}</h2><p>{copy('Pilih pola visual untuk header profil.','Choose a visual treatment for your profile header.')}</p></div></div><div className="custom-grid banner-grid">{PROFILE_BANNERS.map(item=><OptionCard key={item.id} item={item} type="banner" selected={customization.banner===item.id} onSelect={updateCustomization} ctx={ctx} lang={lang}/>)}</div></section>
  </div>;
}
