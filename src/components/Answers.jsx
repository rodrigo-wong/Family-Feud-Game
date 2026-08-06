import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Answers() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewQuestions = location.state?.questions ?? null;
  const previewTitle = location.state?.title ?? null;
  const backTo = previewQuestions ? '/select-game' : '/';

  const [game] = useState(() => {
    if (previewQuestions) return previewQuestions;
    try {
      const stored = localStorage.getItem('familyFeudQuestions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-8 text-white">
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-lg font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold">
        {previewTitle ? `${previewTitle} — Review Answers` : 'Review Answers'}
      </h1>

      {game.length > 0 && (
        <button
          type="button"
          onClick={() => setRevealed((prev) => !prev)}
          className="bg-gray-900 border-2 border-yellow-400 rounded-2xl px-6 py-2 text-xl cursor-pointer hover:bg-white/10"
        >
          {revealed ? 'Hide Answers' : 'Reveal Answers'}
        </button>
      )}

      {game.length === 0 ? (
        <p className="text-white/70">
          No game saved yet.{' '}
          <Link to="/setup-game" className="underline hover:text-white">
            Set up a game
          </Link>{' '}
          first.
        </p>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {game.map((q, qIndex) => (
            <div
              key={q.id ?? qIndex}
              className="bg-gray-900 border-2 border-yellow-400 rounded-2xl p-4"
            >
              <p className="font-bold text-xl mb-2">
                Q{qIndex + 1}. {q.text}
              </p>
              {revealed ? (
                <ol className="flex flex-col gap-1">
                  {q.answers.map((a, aIndex) => (
                    <li
                      key={a.id ?? aIndex}
                      className="flex justify-between border-b border-white/10 py-1 last:border-0"
                    >
                      <span>
                        {aIndex + 1}. {a.text}
                      </span>
                      <span className="text-white/70 font-bold">{a.points}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-white/40 text-sm italic">
                  {q.answers.length} answer{q.answers.length === 1 ? '' : 's'} hidden
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Answers;
