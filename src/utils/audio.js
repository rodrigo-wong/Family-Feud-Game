const VOLUME_KEY = 'familyFeudVolume';
const listeners = new Set();
const playingAudio = new Set();

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
  playingAudio.forEach((audio) => {
    audio.volume = volume;
  });
  listeners.forEach((listener) => listener(volume));
};

export const subscribeVolume = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const playSound = (src) => {
  const audio = new Audio(src);
  audio.volume = volume;
  playingAudio.add(audio);
  audio.addEventListener('ended', () => playingAudio.delete(audio));
  audio.play();
};
