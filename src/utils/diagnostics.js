export function buildDiagnostics({gameId='general',session=null,version='1.18.0'}={}){const actions=(session?.actions||[]).slice(-20).map(x=>`${Math.round((x.t||0)/1000)}s:${x.type||'action'}:${x.label||''}`).join(' | ');return [
 `Brain Arena v${version}`,
 `Route: ${globalThis.location?.hash||'-'}`,
 `Game: ${gameId}`,
 `Mode: ${session?.mode||'-'}`,
 `Level: ${session?.schoolLevel||'-'} / ${session?.universityDifficulty||'-'}`,
 `Seed: ${session?.challengeCode||'-'}`,
 `Viewport: ${globalThis.innerWidth||0}x${globalThis.innerHeight||0}`,
 `Online: ${globalThis.navigator?.onLine?'yes':'no'}`,
 `PWA: ${globalThis.matchMedia?.('(display-mode: standalone)')?.matches?'yes':'no'}`,
 `UA: ${globalThis.navigator?.userAgent||'-'}`,
 `Last actions: ${actions||'-'}`,
].join('\n');}
