import { challengeCodeGameId, normalizeChallengeCode } from './competitive.js';

export function challengeLink(code, baseHref = globalThis.location?.href || '') {
  const normalized=normalizeChallengeCode(code);
  if (!normalized || !challengeCodeGameId(normalized)) return '';
  try {
    const url=new URL(baseHref || 'https://example.invalid/');
    url.hash=`/challenge/${encodeURIComponent(normalized)}`;
    return url.toString();
  } catch { return `#/challenge/${encodeURIComponent(normalized)}`; }
}
export function challengeCodeFromHash(hash='') {
  const raw=String(hash).replace(/^#\/?/,'');
  const match=/^challenge\/([^/?#]+)/i.exec(raw);
  if (!match) return '';
  try { return normalizeChallengeCode(decodeURIComponent(match[1])); } catch { return normalizeChallengeCode(match[1]); }
}
export function qrImageUrl(value,size=240) {
  const safe=Math.max(120,Math.min(420,Number(size)||240));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${safe}x${safe}&margin=8&data=${encodeURIComponent(String(value||''))}`;
}
