export const FEEDBACK_TYPES = [
  { id:'suggestion', label:{ id:'Saran fitur', en:'Feature suggestion' } },
  { id:'bug', label:{ id:'Laporan bug', en:'Bug report' } },
  { id:'gameplay', label:{ id:'Gameplay', en:'Gameplay' } },
  { id:'ui', label:{ id:'UI / UX', en:'UI / UX' } },
  { id:'content', label:{ id:'Konten / panduan', en:'Content / guides' } },
  { id:'other', label:{ id:'Lainnya', en:'Other' } },
];

const MAX_MESSAGE = 3000;
const MAX_SUBJECT = 120;
const MAX_NAME = 60;
const MAX_EMAIL = 160;
const DEV_MAIL_PARTS = ['YXpp','ei5h','cmph','Zzkw','QGdt','YWls','LmNv','bQ=='];

export function feedbackRecipient() {
  try { return atob(DEV_MAIL_PARTS.join('')); }
  catch { return ''; }
}

export function feedbackEndpoint() {
  const recipient = feedbackRecipient();
  return recipient ? `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}` : '';
}

export function cleanFeedback(input = {}) {
  const type = FEEDBACK_TYPES.some(item => item.id === input.type) ? input.type : 'suggestion';
  const ratingRaw = Math.floor(Number(input.rating) || 0);
  const rating = Math.min(5, Math.max(1, ratingRaw || 5));
  return {
    type,
    gameId: String(input.gameId || 'general').slice(0, 40),
    subject: String(input.subject || '').trim().slice(0, MAX_SUBJECT),
    message: String(input.message || '').trim().slice(0, MAX_MESSAGE),
    playerName: String(input.playerName || '').trim().slice(0, MAX_NAME),
    playerEmail: String(input.playerEmail || '').trim().slice(0, MAX_EMAIL),
    rating,
    includeDiagnostics: Boolean(input.includeDiagnostics),
    honey: String(input.honey || '').trim().slice(0, 120),
  };
}

export function validateFeedback(input = {}) {
  const data = cleanFeedback(input);
  if (data.honey) return { valid:false, code:'spam', data };
  if (data.subject.length < 4) return { valid:false, code:'subject', data };
  if (data.message.length < 15) return { valid:false, code:'message', data };
  if (data.playerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.playerEmail)) return { valid:false, code:'email', data };
  return { valid:true, code:null, data };
}

export function buildFeedbackPayload(input, context = {}) {
  const { data } = validateFeedback(input);
  const typeLabel = FEEDBACK_TYPES.find(item => item.id === data.type)?.label?.id || data.type;
  const payload = {
    _subject: `[Brain Arena Feedback] ${typeLabel}: ${data.subject}`,
    _template: 'table',
    _captcha: 'false',
    _honey: data.honey,
    'Jenis masukan': typeLabel,
    'Game / area': context.gameTitle || data.gameId || 'Umum',
    'Rating pengalaman': `${data.rating}/5`,
    'Subjek': data.subject,
    'Pesan pemain': data.message,
    'Nama pemain': data.playerName || 'Anonim',
    'Versi aplikasi': context.version || 'Brain Arena',
    'Halaman asal': context.route || '-',
    'Waktu lokal pemain': context.localTime || new Date().toLocaleString(),
  };
  if (data.playerEmail) payload.email = data.playerEmail;
  if (data.includeDiagnostics) {
    payload['Info teknis'] = context.diagnostics || 'Tidak tersedia';
  }
  return payload;
}

export async function sendFeedback(input, context = {}, fetchImpl = globalThis.fetch) {
  const checked = validateFeedback(input);
  if (!checked.valid) return { ok:false, validation:checked.code };
  if (typeof fetchImpl !== 'function') return { ok:false, error:'fetch-unavailable' };
  const endpoint = feedbackEndpoint();
  if (!endpoint) return { ok:false, error:'recipient-unavailable' };
  const response = await fetchImpl(endpoint, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Accept:'application/json' },
    body:JSON.stringify(buildFeedbackPayload(checked.data, context)),
  });
  let body = null;
  try { body = await response.json(); } catch {}
  return { ok:Boolean(response.ok && body?.success !== false), status:response.status, body };
}
