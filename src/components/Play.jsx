import { useState } from 'react';
import { Link } from 'react-router-dom';

const SLOT_COUNT = 8;

function Play() {
  const [questionPoints] = useState(0);
  const [teamOneScore] = useState(0);
  const [teamTwoScore] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [strikes, setStrikes] = useState(0);

  const [currentQuestion] = useState(() => {
    try {
      const stored = localStorage.getItem('familyFeudQuestions');
      const game = stored ? JSON.parse(stored) : [];
      return game[0]?.text ?? '';
    } catch {
      return '';
    }
  });

  const toggleStrikes = (value) => {
    setStrikes((prev) => (prev === value ? 0 : value));
  };

  return (
    <div className="relative flex flex-col items-center h-screen overflow-hidden px-4 py-4 text-white">
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4">
        {showQuestion && (
          <div className="max-w-2xl text-center rounded-2xl bg-[#0a1c57] border-4 border-yellow-400 px-6 py-2 text-lg sm:text-xl font-bold shadow-[0_0_25px_rgba(250,204,21,0.5)]">
            {currentQuestion || 'No question set yet.'}
          </div>
        )}

        <div
          className="relative w-full max-w-6xl border-4 border-yellow-400 px-20 py-10 sm:px-28 sm:py-16 shadow-[0_0_80px_rgba(250,204,21,0.35)]"
          style={{
            borderRadius: '40%',
            backgroundColor: '#050b24',
            backgroundImage: 'radial-gradient(circle, #facc15 2.5px, transparent 2.5px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-36 h-14 rounded-xl bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-[1.2]">
            <span className="text-4xl font-extrabold tracking-wide">{questionPoints}</span>
          </div>

          <div className="absolute top-1/2 -left-6 sm:-left-10 -translate-y-1/2 z-20 flex items-center justify-center w-24 sm:w-28 h-16 rounded-md bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 border-4 border-yellow-400 scale-[1.2]">
            <span className="text-4xl font-extrabold">{teamOneScore}</span>
          </div>

          <div className="absolute top-1/2 -right-6 sm:-right-10 -translate-y-1/2 z-20 flex items-center justify-center w-24 sm:w-28 h-16 rounded-md bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 border-4 border-yellow-400 scale-[1.2]">
            <span className="text-4xl font-extrabold">{teamTwoScore}</span>
          </div>

          <div className="relative rounded-[2.5rem] bg-black/70 border-4 border-yellow-400/80 pt-8 pb-8 px-4 sm:px-6">
            <div className="grid grid-cols-2 grid-rows-4">
              {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="m-0.5 rounded-md border-4 border-black bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 p-1"
                >
                  <div className="rounded-sm h-11 sm:h-14 bg-[linear-gradient(to_bottom,#cfe9ff_0%,#4f8bf0_18%,#1a3fa0_55%,#0a1c57_100%)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]" />
                </div>
              ))}
            </div>

            {strikes > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 rounded-[2.5rem] z-30">
                {Array.from({ length: strikes }).map((_, i) => (
                  <span
                    key={i}
                    className="text-4xl sm:text-5xl font-black text-red-600 [-webkit-text-stroke:3px_white] drop-shadow-[0_0_20px_rgba(220,38,38,0.9)]"
                  >
                    X
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
        <div className="flex flex-wrap items-center justify-center gap-78 pb-2">
            <button
              type="button"
              onClick={() => setShowQuestion((prev) => !prev)}
              className={`rounded-xl px-5 py-2 text-3xl font-bold cursor-pointer transition ${
                showQuestion
                  ? 'text-black'
                  : 'bg-gray-900  hover:bg-[#123086]'
              }`}
            >
              Show Question
            </button>
          <div className="flex flex-wrap items-center justify-center gap-1 pb-2">

        {[1, 2, 3].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleStrikes(value)}
            className={`rounded-full border-4 px-2 text-2xl font-black cursor-pointer transition min-w-12${
              strikes === value
                ? 'bg-red-600 border-white text-white'
                : 'bg-gray-900 border-red-600 text-red-500 hover:bg-red-950'
            }`}
          >
            {'X'.repeat(value)}
          </button>
        ))}
          </div>
      </div>
    </div>
  );
}

export default Play;
