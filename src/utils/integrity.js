export function createSessionIntegrity(mode = 'practice') {
  return {
    version: 1,
    mode,
    recoveryCount: 0,
    visibilityChanges: 0,
    focusLosses: 0,
    startedVisible: typeof document === 'undefined' ? true : !document.hidden,
  };
}

export function integrityLabel(integrity = {}, lang = 'id') {
  const en = lang === 'en';
  const recovery = Math.max(0, Number(integrity.recoveryCount) || 0);
  const visibility = Math.max(0, Number(integrity.visibilityChanges) || 0);
  if (!recovery && visibility <= 2) return { status:'clean', label:en?'Clean Run':'Clean Run' };
  if (recovery) return { status:'recovered', label:en?`Recovered ×${recovery}`:`Recovered ×${recovery}` };
  return { status:'review', label:en?'Focus changed':'Fokus berpindah' };
}
