// A light-switch click, synthesized so there's no audio file to load: a sharp
// burst of filtered noise for the snap, over a short low thump for the body.
// Shared by the pull cord, the footer switch, and the "D" shortcut.

let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;

// Creating an AudioContext can take tens of milliseconds, so callers warm it on
// pointerdown (a real user gesture) instead of at the moment the click plays.
export function warmClick() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    if (!noise) {
      noise = audio.createBuffer(1, Math.round(audio.sampleRate * 0.03), audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
  } catch {}
}

export function playClick() {
  try {
    warmClick();
    if (!audio || !noise) return;
    const t = audio.currentTime;

    // The snap: bright, very short noise.
    const snap = audio.createBufferSource();
    snap.buffer = noise;
    const band = audio.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 1.2;
    const snapGain = audio.createGain();
    snapGain.gain.setValueAtTime(0.9, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    snap.connect(band).connect(snapGain).connect(audio.destination);
    snap.start(t);
    snap.stop(t + 0.03);

    // The body: a quick low knock from the switch housing.
    const body = audio.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(180, t);
    body.frequency.exponentialRampToValueAtTime(70, t + 0.04);
    const bodyGain = audio.createGain();
    bodyGain.gain.setValueAtTime(0.35, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    body.connect(bodyGain).connect(audio.destination);
    body.start(t);
    body.stop(t + 0.06);
  } catch {}
}
