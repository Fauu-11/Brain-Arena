// One audio context for all games. The master gain silences active and future
// sounds without suspending and replaying a backlog of scheduled tones.
let context = null;
let master = null;
function updateMaster(muted) {
  if (!context || !master) return;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.01);
}
if (typeof window !== 'undefined') {
  window.addEventListener('ba-sound-toggle', event => updateMaster(Boolean(event.detail?.muted)));
}
export function getAudioContext() {
  if (window.__BA_MUTED__) return null;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!context || context.state === 'closed') {
      context = new AudioContext(); master = context.createGain();
      master.gain.value = window.__BA_MUTED__ ? 0 : 1;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  } catch { return null; }
}
export function getAudioDestination() { return master; }
