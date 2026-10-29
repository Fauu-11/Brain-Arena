import React,{useMemo,useState} from 'react';
import {GAMES,CATEGORIES} from '../data/games.js';
import {DIFFICULTY_LEVELS} from '../data/difficulties.js';
import {useLanguage} from '../context/LanguageContext.jsx';
import Artwork from '../components/Artwork.jsx';
import Icon from '../components/Icon.jsx';
export default function Home({onSelectGame}){
  const {lang}=useLanguage();const copy=(id,en)=>lang==='en'?en:id;
  const [query,setQuery]=useState('');const [category,setCategory]=useState('all');
  const games=useMemo(()=>GAMES.filter(game=>(category==='all'||game.category===category)&&`${game.title.id} ${game.title.en} ${game.description[lang]}`.toLowerCase().includes(query.trim().toLowerCase())),[query,category,lang]);
  return <div className="simple-catalog"><header className="catalog-hero"><span className="play-kicker">{copy('HAFALKAN. PIKIRKAN. PECAHKAN.','REMEMBER. THINK. SOLVE.')}</span><h1>{copy('Satu game.','One game.')}<br/><em>{copy('Lima tantangan.','Five challenges.')}</em></h1><p>{copy('Pilih permainan untuk melatih hafalan, logika, strategi, dan hitung mental. Mulai dari SD atau langsung uji diri di Universitas.','Choose a game to practice memory, logic, strategy and mental math. Start with SD or test yourself at Universitas.')}</p><div className="catalog-levels">{DIFFICULTY_LEVELS.map(level=><span key={level.id}>{level.label}</span>)}</div></header>
    <section className="university-intro"><span className="uni-intro-icon"><Icon name="brain" size={28}/></span><div><small>{copy('KHUSUS UNIVERSITAS','UNIVERSITAS EXCLUSIVE')}</small><h2>{copy('Lebih dari papan yang lebih sulit.','More than a harder board.')}</h2><p>{copy('Setiap mulai, satu dari tiga aturan gameplay dipilih secara acak: hafalan, presisi, atau papan dinamis sesuai permainan.','Each start draws one of three gameplay rules: memory, precision or a dynamic board suited to the game.')}</p></div></section>
    <section aria-labelledby="catalog-heading"><div className="catalog-heading"><h2 id="catalog-heading">{copy('Pilih permainanmu','Choose your game')}</h2><label className="catalog-search"><Icon name="search" size={18}/><input id="catalog-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={copy('Cari permainan…','Search games…')} aria-label={copy('Cari permainan','Search games')}/></label></div>
      <div className="catalog-categories" role="group" aria-label={copy('Kategori','Categories')}>{Object.entries(CATEGORIES).map(([id,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label[lang]}</button>)}</div>
      <div className="simple-game-grid">{games.map(game=><article className={`simple-game-card color-${game.color}`} key={game.id}><button className="simple-game-art" onClick={()=>onSelectGame(game.id)} aria-label={`${copy('Mainkan','Play')} ${game.title[lang]}`}><Artwork id={game.id}/><span>{CATEGORIES[game.category][lang]}</span></button><div className="simple-card-body"><h3>{game.title[lang]}</h3><p>{game.description[lang]}</p><small>SD · SMP · SMA · SMA+ · Universitas</small><div><button className="simple-guide" onClick={()=>onSelectGame(`tips-${game.id}`)}><Icon name="book" size={16}/>{copy('Panduan','Guide')}</button><button className="ba-button primary" onClick={()=>onSelectGame(game.id)}>{copy('Mainkan','Play')}<Icon name="arrow" size={16}/></button></div></div></article>)}</div>
      {!games.length&&<div className="empty-state"><p>{copy('Tidak ada game yang cocok.','No games found.')}</p><button className="ba-button outline" onClick={()=>{setQuery('');setCategory('all');}}>{copy('Tampilkan semua','Show all')}</button></div>}
    </section>
  </div>;
}
