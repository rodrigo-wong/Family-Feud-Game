import { useEffect, useState } from 'react';
import { getVolume, setVolume, subscribeVolume } from '../utils/audio';

function VolumeControl() {
  const [volume, setLocalVolume] = useState(getVolume);

  useEffect(() => subscribeVolume(setLocalVolume), []);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-white">
      <span className="text-lg">{volume === 0 ? '🔇' : '🔊'}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Volume"
        className="w-24 cursor-pointer accent-yellow-400"
      />
    </div>
  );
}

export default VolumeControl;
