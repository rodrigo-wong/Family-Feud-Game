import { useState } from 'react';
import { Link } from 'react-router-dom';

function Answers() {
  const [game] = useState(() => {
    try {
      const stored = localStorage.getItem('familyFeudQuestions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-8 text-white">
      <h1 className="text-4xl font-bold">Answers</h1>

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
              className="bg-gray-900 border-2 border-white rounded-2xl p-4"
            >
              <p className="font-bold text-xl mb-2">
                Q{qIndex + 1}. {q.text}
              </p>
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
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <Link to="/setup-game" className="text-white/70 hover:text-white underline">
          Edit Questions
        </Link>
        <Link to="/" className="text-white/70 hover:text-white underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Answers;
