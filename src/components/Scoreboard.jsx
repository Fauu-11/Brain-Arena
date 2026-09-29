import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import Icon from './Icon.jsx';

export default function Scoreboard({ activePlayer, score1, score2, timer = null, maxTime = 10, winScore, mode }) {
  const { lang } = useLanguage();
  const percentage = timer !== null && maxTime > 0 ? Math.min(Math.max(timer / maxTime * 100, 0), 100) : 0;
  const players = [
    { id: 1, score: score1, name: lang === 'en' ? 'Player 1' : 'Pemain 1', icon: 'user' },
    { id: 2, score: score2, name: mode === 'pve' ? 'AI Bot' : lang === 'en' ? 'Player 2' : 'Pemain 2', icon: mode === 'pve' ? 'bot' : 'user' },
  ];
  return <div className="play-scoreboard">
    <div className="play-score-players">{players.map(p => <React.Fragment key={p.id}>{p.id === 2 && <div className={`play-turn-clock ${timer !== null && timer <= 3 ? 'urgent' : ''}`}>{timer !== null ? <><Icon name="clock" size={14}/><strong>{timer}<small>s</small></strong></> : <span>VS</span>}</div>}<div className={`play-player player-${p.id} ${activePlayer === p.id ? 'active' : ''}`}><span className="play-player-avatar"><Icon name={p.icon} size={20}/></span><div><span>{p.name}</span><small>{activePlayer === p.id ? (lang === 'en' ? 'Your turn' : 'Giliran bermain') : (lang === 'en' ? 'Waiting' : 'Menunggu')}</small></div><strong>{p.score}{winScore ? <small>/{winScore}</small> : null}</strong></div></React.Fragment>)}</div>
    {timer !== null && <div className="play-timer-track" role="meter" aria-label={lang === 'en' ? 'Time remaining' : 'Sisa waktu'} aria-valuemin={0} aria-valuemax={maxTime} aria-valuenow={Math.max(0, timer)}><div style={{ width: `${percentage}%`, backgroundColor: timer <= 3 ? 'var(--uw-danger)' : activePlayer === 1 ? 'var(--uw-primary)' : 'var(--uw-secondary)' }}/></div>}
  </div>;
}
