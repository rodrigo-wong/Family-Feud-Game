const VOLUME_KEY = 'familyFeudVolume';
const listeners = new Set();
let currentAudio = null;

let volume = (() => {
  const raw = localStorage.getItem(VOLUME_KEY);
  if (raw === null) return 1;
  const stored = Number(raw);
  return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : 1;
})();

export const getVolume = () => volume;

export const setVolume = (value) => {
  volume = Math.min(1, Math.max(0, value));
  localStorage.setItem(VOLUME_KEY, String(volume));
  if (currentAudio) {
    currentAudio.volume = volume;
  }
  listeners.forEach((listener) => listener(volume));
};

export const subscribeVolume = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const playSound = (src) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const audio = new Audio(src);
  audio.volume = volume;
  currentAudio = audio;
  audio.addEventListener('ended', () => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.play();
};
