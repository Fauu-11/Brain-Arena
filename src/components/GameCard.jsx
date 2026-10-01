import React from 'react';
import Artwork from './Artwork.jsx';
import Icon from './Icon.jsx';
import { CATEGORIES, DIFFICULTIES } from '../data/games.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useArena } from '../context/ArenaContext.jsx';
export default function GameCard({ game, onSelectGame }) {
  const { lang } = useLanguage(); const { favorites, toggleFavorite, pinnedGames, togglePinnedGame, setNotice } = useArena();
  const favorite = favorites.includes(game.id); const pinned=pinnedGames.includes(game.id);
  const playLabel = `${lang === 'id' ? 'Mainkan' : 'Play'} ${game.title[lang]}`;
  return <article className={`game-card color-${game.color}`} data-game={game.id}>
    <div className="game-art"><button className="art-play" onClick={() => onSelectGame(game.id)} aria-label={playLabel}><Artwork id={game.id}/></button>
      <span className="season-label">{lang === 'id' ? 'MUSIM' : 'SEASON'} {game.season}</span>
      <button className={`pin-button ${pinned ? 'is-pinned' : ''}`} aria-pressed={pinned} aria-label={`${pinned ? (lang==='id'?'Lepas pin':'Unpin') : (lang==='id'?'Pin game':'Pin game')}: ${game.title[lang]}`} onClick={()=>{togglePinnedGame(game.id);setNotice(pinned?(lang==='id'?'Pin dilepas':'Game unpinned'):(lang==='id'?'Game dipin ke sidebar':'Game pinned to sidebar'));}}><Icon name="flag" size={15} filled={pinned}/></button>
      <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} aria-pressed={favorite} aria-label={`${favorite ? (lang === 'id' ? 'Hapus favorit' : 'Remove favorite') : (lang === 'id' ? 'Tambah favorit' : 'Add favorite')}: ${game.title[lang]}`} onClick={() => { toggleFavorite(game.id); setNotice(favorite ? (lang === 'id' ? 'Dihapus dari favorit' : 'Removed from favorites') : (lang === 'id' ? 'Ditambahkan ke favorit' : 'Added to favorites')); }}><Icon name="star" size={17} filled={favorite}/></button>
    </div>
    <div className="game-card-body"><div className="card-heading"><h3><button onClick={() => onSelectGame(game.id)}>{game.title[lang]}</button></h3><span className={`difficulty ${game.difficulty}`}><i/>{DIFFICULTIES[game.difficulty][lang]}</span></div>
      <p>{game.description[lang]}</p>
      <div className="game-metadata"><span><Icon name={game.icon} size={13}/>{CATEGORIES[game.category][lang]}</span><span className="meta-dot"/><span><Icon name={game.mode === 'solo' ? 'user' : 'users'} size={13}/>{game.mode === 'solo' ? 'Solo' : (lang === 'id' ? 'Duel lokal' : 'Local duel')}</span></div>
      <div className="card-bottom"><button className="card-guide" onClick={() => onSelectGame(`tips-${game.id}`)}><Icon name="book" size={14}/>{lang === 'id' ? 'Panduan' : 'Guide'}</button><button className="card-play" aria-label={playLabel} onClick={() => onSelectGame(game.id)}>{lang === 'id' ? 'Mainkan' : 'Play now'}<Icon name="arrow" size={16}/></button></div>
    </div>
  </article>;
}
