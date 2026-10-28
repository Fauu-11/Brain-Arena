import { GAMES, resolveRoute } from './games.js';

// Shared by the expanded sidebar, compact rail, drawer and command palette.
export const PRIMARY_NAVIGATION = [
  { id:'home', icon:'home', label:{ id:'Beranda', en:'Home' } },
  { id:'games', icon:'grid', label:{ id:'Permainan', en:'Games' } },
  { id:'challenges', icon:'bolt', label:{ id:'Tantangan', en:'Challenges' } },
  { id:'progress', icon:'activity', label:{ id:'Progres', en:'Progress' } },
  { id:'guides', icon:'book', label:{ id:'Panduan', en:'Guides' } },
];

export const FOOTER_NAVIGATION = [
  { id:'settings', icon:'sliders', label:{ id:'Pengaturan', en:'Settings' }, keywords:'backup export import restore automatic' },
  { id:'profile', icon:'user', label:{ id:'Profil', en:'Profile' }, keywords:'pemain player' },
];

// Canonical destinations only: legacy aliases remain owned by the route resolver.
export const NAVIGATION_DESTINATIONS = [
  ...PRIMARY_NAVIGATION.map(item=>({ ...item, parent:item.id })),
  ...FOOTER_NAVIGATION.map(item=>({ ...item, parent:item.id })),
  { id:'favorites', parent:'games', icon:'star', label:{ id:'Favorit', en:'Favorites' } },
  { id:'daily', parent:'challenges', icon:'spark', label:{ id:'Tantangan Harian', en:'Daily Challenge' } },
  { id:'daily-archive', parent:'challenges', icon:'clock', label:{ id:'Arsip Harian', en:'Daily Archive' } },
  { id:'arena-run', parent:'challenges', icon:'gamepad', label:{ id:'Arena Run', en:'Arena Run' }, keywords:'tournament turnamen' },
  { id:'arena-cup', parent:'challenges', icon:'trophy', label:{ id:'Arena Cup', en:'Arena Cup' }, keywords:'bracket tournament' },
  { id:'events', parent:'challenges', icon:'bolt', label:{ id:'Event', en:'Events' } },
  { id:'season', parent:'challenges', icon:'spark', label:{ id:'Musim', en:'Season' } },
  { id:'leaderboard', parent:'challenges', icon:'trophy', label:{ id:'Papan Peringkat Lokal', en:'Local Leaderboard' } },
  { id:'arena-builder', parent:'challenges', icon:'sliders', label:{ id:'Arena Builder', en:'Arena Builder' }, keywords:'custom tournament' },
  { id:'practice-lab', parent:'challenges', icon:'brain', label:{ id:'Practice Lab', en:'Practice Lab' }, keywords:'drill training latihan' },
  { id:'challenge', parent:'challenges', icon:'flag', label:{ id:'Tautan Tantangan', en:'Challenge Link' } },
  { id:'activity', parent:'progress', icon:'activity', label:{ id:'Aktivitas Saya', en:'My Activity' } },
  { id:'history', parent:'progress', icon:'clock', label:{ id:'Riwayat Pertandingan', en:'Match History' } },
  { id:'replay', parent:'progress', icon:'play', label:{ id:'Replay', en:'Replay' } },
  { id:'achievements', parent:'progress', icon:'medal', label:{ id:'Pencapaian & Lencana', en:'Achievements & Badges' } },
  { id:'missions', parent:'progress', icon:'checklist', label:{ id:'Misi', en:'Missions' }, keywords:'quest hadiah claim rewards' },
  { id:'rank', parent:'progress', icon:'shield', label:{ id:'Arena Rank', en:'Arena Rank' } },
  { id:'mastery', parent:'progress', icon:'trophy', label:{ id:'Penguasaan Game', en:'Game Mastery' } },
  { id:'completion', parent:'progress', icon:'medal', label:{ id:'Koleksi Penyelesaian', en:'Game Completion' } },
  { id:'statistics', parent:'progress', icon:'activity', label:{ id:'Statistik', en:'Statistics' } },
  { id:'activity-calendar', parent:'progress', icon:'clock', label:{ id:'Kalender Aktivitas', en:'Activity Calendar' }, keywords:'streak heatmap' },
  { id:'goals', parent:'progress', icon:'flag', label:{ id:'Target Personal', en:'Personal Goals' } },
  { id:'customize', parent:'profile', icon:'sliders', label:{ id:'Kustomisasi Profil', en:'Profile Customization' } },
  { id:'profiles', parent:'profile', icon:'users', label:{ id:'Profil Lokal', en:'Local Profiles' }, keywords:'switch account ganti pemain' },
  { id:'showcase', parent:'profile', icon:'medal', label:{ id:'Player Showcase', en:'Player Showcase' } },
  { id:'share-result', parent:'profile', icon:'medal', label:{ id:'Kartu Hasil', en:'Result Card' } },
  { id:'controls', parent:'settings', icon:'gamepad', label:{ id:'Keyboard & Controller', en:'Keyboard & Controller' } },
  { id:'offline', parent:'settings', icon:'download', label:{ id:'Kelola Konten Offline', en:'Offline Manager' }, keywords:'download cache pwa install' },
  { id:'save-slots', parent:'settings', icon:'shield', label:{ id:'Slot Simpan', en:'Save Slots' }, keywords:'backup checkpoint' },
  { id:'storage-center', parent:'settings', icon:'layers', label:{ id:'Pusat Penyimpanan', en:'Storage Center' }, keywords:'cleanup cache optimize' },
  { id:'data-health', parent:'settings', icon:'shield', label:{ id:'Kesehatan Data', en:'Data Health' }, keywords:'repair restore' },
  { id:'diagnostics', parent:'settings', icon:'activity', label:{ id:'Diagnostik Sistem', en:'System Diagnostics' }, keywords:'crash service worker' },
  { id:'cloud-readiness', parent:'settings', icon:'layers', label:{ id:'Kesiapan Cloud (Belum Aktif)', en:'Cloud Readiness (Not Active)' }, keywords:'supabase migration indexeddb sync queue repository v2' },
  { id:'feedback', parent:'settings', icon:'message', label:{ id:'Masukan & Saran', en:'Feedback & Suggestions' } },
];

/** Returns one of the five primary IDs, settings/profile, or null for unknown routes.
 * Accepts canonical views as well as existing hashes, game slugs and aliases.
 * No browser state is read, so the mapping can be unit-tested in Node.
 */
export function getActiveNavId(currentView = 'home') {
  if (typeof currentView !== 'string') return null;
  let path;
  try { path = decodeURIComponent(currentView.replace(/^#\/?/, '').split('?')[0]).replace(/\/+$/, ''); }
  catch { return null; }
  if (path === 'challenges' || path === 'tantangan') return 'challenges';
  if (path === 'progress' || path === 'progres') return 'progress';
  const view = resolveRoute(currentView);
  if (GAMES.some(game=>game.id === view)) return 'games';
  if (view.startsWith('tips-')) return 'guides';
  return NAVIGATION_DESTINATIONS.find(item=>item.id === view)?.parent || null;
}

export function isNavActive(itemId, currentView) {
  return getActiveNavId(currentView) === itemId;
}
