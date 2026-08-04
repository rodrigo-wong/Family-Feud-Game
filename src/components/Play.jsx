import { useState } from 'react';
import { Link } from 'react-router-dom';

const SLOT_COUNT = 8;

function Play() {
  const [teamOneScore] = useState(0);
  const [teamTwoScore] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [revealed, setRevealed] = useState(() => new Set());

  const [game] = useState(() => {
    try {
      const stored = localStorage.getItem('familyFeudQuestions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [questionIndex, setQuestionIndex] = useState(0);

  const currentQuestion = game[questionIndex]?.text ?? '';
  const currentAnswers = game[questionIndex]?.answers ?? [];
  const questionPoints = currentAnswers.reduce(
    (sum, a, i) => (revealed.has(i) ? sum + (Number(a.points) || 0) : sum),
    0
  );

  const toggleStrikes = (value) => {
    setStrikes((prev) => (prev === value ? 0 : value));
  };

  const revealAnswer = (index) => {
    if (index >= currentAnswers.length) return;
    setRevealed((prev) => new Set(prev).add(index));
  };

  const goToQuestion = (index) => {
    setQuestionIndex(index);
    setShowQuestion(false);
    setStrikes(0);
    setRevealed(new Set());
  };
  const goPrev = () => goToQuestion(Math.max(questionIndex - 1, 0));
  const goNext = () => goToQuestion(Math.min(questionIndex + 1, game.length - 1));

  return (
    <div className="relative flex flex-col items-center h-screen overflow-hidden px-4 py-4 text-white">
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4">
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

          <div className="relative">
            <div className="relative rounded-[2.5rem] bg-black/70 border-4 border-yellow-400/80 pt-8 pb-8 px-4 sm:px-6">
              <div className="grid grid-cols-2 grid-rows-4">
                {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                  const answer = currentAnswers[i];
                  const isRevealed = revealed.has(i);

                  return (
                    <div
                      key={i}
                      className="m-0.5 rounded-md border-4 border-black bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 p-1 [perspective:1000px]"
                    >
                      <button
                        type="button"
                        onClick={() => revealAnswer(i)}
                        disabled={!answer || isRevealed}
                        className={`relative w-full h-11 sm:h-14 [transform-style:preserve-3d] transition-transform duration-500 ease-in-out ${
                          isRevealed ? '[transform:rotateX(180deg)]' : ''
                        } ${answer ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className="absolute inset-0 rounded-sm flex items-center justify-center [backface-visibility:hidden] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-[linear-gradient(to_bottom,#cfe9ff_0%,#4f8bf0_18%,#1a3fa0_55%,#0a1c57_100%)]">
                          <span className="font-extrabold text-lg sm:text-xl">
                            {answer ? i + 1 : ''}
                          </span>
                        </span>

                        <span className="absolute inset-0 rounded-sm overflow-hidden flex gap-1 bg-black [backface-visibility:hidden] [transform:rotateX(180deg)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                          {answer && (
                            <>
                              <span className="flex-1 h-full flex items-center px-3 sm:px-4 bg-[linear-gradient(to_bottom,#3b5170_0%,#1b2740_55%,#0d1524_100%)]">
                                <span className="font-extrabold text-sm sm:text-lg uppercase truncate text-white">
                                  {answer.text}
                                </span>
                              </span>
                              <span className="w-14 sm:w-20 shrink-0 h-full flex items-center justify-center bg-[linear-gradient(to_bottom,#cfe9ff_0%,#4f8bf0_18%,#1a3fa0_55%,#0a1c57_100%)]">
                                <span className="font-extrabold text-lg sm:text-2xl text-white">
                                  {answer.points}
                                </span>
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {!showQuestion && strikes > 0 && (
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

            {showQuestion && (
              <div className="absolute inset-0 rounded-[2.5rem] bg-[#0a1c57] border-4 border-white flex items-center justify-center px-6 sm:px-10 z-40">
                <p className="text-center text-white text-2xl sm:text-4xl font-bold">
                  {currentQuestion || 'No question set yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {game.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={questionIndex === 0}
              className="text-2xl px-2 cursor-pointer hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Previous question"
            >
              ‹‹
            </button>

            <div className="flex items-center gap-2">
              {game.map((q, i) => (
                <button
                  key={q.id ?? i}
                  type="button"
                  onClick={() => goToQuestion(i)}
                  aria-label={`Go to question ${i + 1}`}
                  className={`w-3 h-3 rounded-full cursor-pointer transition ${
                    i === questionIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={questionIndex === game.length - 1}
              className="text-2xl px-2 cursor-pointer hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Next question"
            >
              ››
            </button>

            <span className="text-white/60 text-sm">
              Question {questionIndex + 1} of {game.length}
            </span>
          </div>
        )}
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
