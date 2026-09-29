import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Cast() {
  const { lang } = useLanguage();
  const [activeSeason, setActiveSeason] = useState(1);

  const castData = {
    1: [
      {
        university: 'Seoul National University (SNU)',
        color: '#1f3149',
        members: ['Hyun-bin Jung', 'Do-hyun Song', 'Ji-min Park', 'Hyun-seok Roh']
      },
      {
        university: 'KAIST',
        color: '#218a8f',
        members: ['Sung-bum Heo', 'Hyun-ji So', 'Joon-seo Yang', 'Seo-yul Choi']
      },
      {
        university: 'POSTECH',
        color: '#c95555',
        members: ['Min-seop Shin', 'Jae-yoon Lee', 'Gyu-min Moon', 'Min-jae Kang']
      },
      {
        university: 'Yonsei University',
        color: '#3c78d3',
        members: ['Ki-hong Son', 'Yong-jun Park', 'Eun-ji Cho', 'Seung-min Nam']
      },
      {
        university: 'Korea University',
        color: '#901b1b',
        members: ['Jung-min Lee', 'Seung-woo Chae', 'Ji-won Kim', 'Dong-kyu Han']
      },
      {
        university: 'Harvard University',
        color: '#701c1c',
        members: ['Janice Nam', 'David Kwak', 'Sky Jung', 'Ray Kim']
      }
    ],
    2: [
      {
        university: 'Seoul National University (SNU)',
        color: '#1f3149',
        members: ['Min-woo Kang', 'Hye-won Yoon', 'Jun-young Park', 'Ji-a Seo']
      },
      {
        university: 'KAIST',
        color: '#218a8f',
        members: ['Tae-jun Kim', 'Na-young Lim', 'Dong-hyun Shin', 'Ji-won Oh']
      },
      {
        university: 'Korea University',
        color: '#901b1b',
        members: ['Sung-ho Choi', 'So-hyun Park', 'Ji-hoon Yoon', 'Eun-seok Song']
      },
      {
        university: 'Yonsei University',
        color: '#3c78d3',
        members: ['Young-jae Jo', 'Min-ji Kim', 'Jae-seo Lee', 'Da-hye Shin']
      },
      {
        university: 'Oxford University',
        color: '#102b4e',
        members: ['Oliver Harrison', 'Charlotte Smith', 'Thomas Brown', 'Emily Davies']
      },
      {
        university: 'Cambridge University',
        color: '#1a5f57',
        members: ['James Wilson', 'Sophie Evans', 'Daniel Thomas', 'Olivia Roberts']
      }
    ],
    3: [
      {
        university: 'Seoul National University (SNU)',
        color: '#1f3149',
        members: ['Sang-wook Park', 'Da-eun Choi', 'Ji-seong Kim', 'Hee-young Lee']
      },
      {
        university: 'KAIST',
        color: '#218a8f',
        members: ['Jung-hoon Lim', 'Seo-yeon Park', 'Min-kyu Cho', 'Ye-ji Han']
      },
      {
        university: 'MIT',
        color: '#a31d1d',
        members: ['Alex Johnson', 'Chloe Miller', 'Ryan Davis', 'Sarah Wilson']
      },
      {
        university: 'Stanford University',
        color: '#8c1515',
        members: ['Michael Clark', 'Emma Rodriguez', 'Jacob Martinez', 'Sophia Hernandez']
      },
      {
        university: 'Peking University',
        color: '#800000',
        members: ['Wei Zhang', 'Li Na', 'Chen Jun', 'Wang Lin']
      }
    ]
  };

  return (
    <div>
      <section style={{
        textAlign: 'center',
        marginBottom: 'var(--uw-space-5)'
      }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--uw-primary)', marginBottom: 'var(--uw-space-1)' }}>
          {lang === 'en' ? 'CONTESTANT CAST PROFILES' : 'PROFIL TIM DAN PESERTA'}
        </h2>
        <p style={{ color: 'var(--uw-text-muted)', fontSize: '1.1rem' }}>
          {lang === 'en'
            ? 'Explore the elite academic teams that compete in University War across all seasons.'
            : 'Jelajahi tim akademis elit yang bersaing di University War di semua musim.'}
        </p>
      </section>

      {/* Season Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--uw-space-2)',
        marginBottom: 'var(--uw-space-4)'
      }}>
        {[1, 2, 3].map((seasonNum) => (
          <button
            key={seasonNum}
            className="uw-btn"
            onClick={() => setActiveSeason(seasonNum)}
            style={{
              padding: 'var(--uw-space-2) var(--uw-space-4)',
              border: activeSeason === seasonNum ? 'none' : '1px solid var(--uw-border)',
              backgroundColor: activeSeason === seasonNum ? 'var(--uw-primary)' : 'var(--uw-surface-strong)',
              color: activeSeason === seasonNum ? 'var(--uw-text-on-primary)' : 'var(--uw-text)',
              fontFamily: 'Arial',
              fontSize: '1.2rem',
              letterSpacing: '0.05em'
            }}
          >
            {lang === 'en' ? `Season ${seasonNum} Cast` : `Peserta Musim ${seasonNum}`}
          </button>
        ))}
      </div>

      {/* University Teams list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 'var(--uw-space-4)'
      }}>
        {castData[activeSeason].map((team, index) => (
          <div
            key={index}
            className="uw-card"
            style={{
              borderLeft: `6px solid ${team.color}`,
              padding: 'var(--uw-space-4)',
              backgroundColor: 'var(--uw-surface-strong)'
            }}
          >
            <h3 style={{
              fontSize: '1.6rem',
              color: team.color,
              marginBottom: 'var(--uw-space-3)',
              borderBottom: '1px solid var(--uw-border)',
              paddingBottom: 'var(--uw-space-1)'
            }}>
              🏫 {team.university}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--uw-space-3)'
            }}>
              {team.members.map((member, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    backgroundColor: 'var(--uw-bg)',
                    padding: 'var(--uw-space-2)',
                    borderRadius: 'var(--uw-radius-sm)',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--uw-text)',
                    border: '1px solid var(--uw-border)'
                  }}
                >
                  👤 {member}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
