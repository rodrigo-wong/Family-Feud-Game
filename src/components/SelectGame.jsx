import { useNavigate, Link } from 'react-router-dom';
import gameData from '../data/data.json';

const loadCustomGame = () => {
  try {
    const stored = localStorage.getItem('familyFeudCustomGame');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

function GameCard({ name, questionCount, onPlay, onViewAnswers, highlight }) {
  return (
    <div
      className={`bg-gray-900 border-2 rounded-2xl p-4 flex flex-col gap-3 ${
        highlight ? 'border-yellow-400' : 'border-white'
      }`}
    >
      <div>
        <p className="text-xl font-bold">{name}</p>
        <p className="text-white/60 text-sm mt-1">
          {questionCount} question{questionCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPlay}
          className="flex-1 rounded-xl border-2 border-white px-3 py-2 text-sm font-bold cursor-pointer hover:bg-white/10 transition"
        >
          Play
        </button>
        <button
          type="button"
          onClick={onViewAnswers}
          className="flex-1 rounded-xl border-2 border-white/40 px-3 py-2 text-sm font-bold cursor-pointer hover:bg-white/10 transition"
        >
          View
        </button>
      </div>
    </div>
  );
}

function SelectGame() {
  const navigate = useNavigate();
  const customGame = loadCustomGame();

  const playGame = (questions) => {
    localStorage.setItem('familyFeudQuestions', JSON.stringify(questions));
    navigate('/', { state: { stage: 'teamNames' } });
  };

  const viewAnswers = (questions, title) => {
    navigate('/answers', { state: { questions, title } });
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-10 text-white">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-lg font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
      >
        ← Home
      </Link>

      <h1 className="text-4xl font-bold">Select a Game</h1>

      {customGame && (
        <section className="w-full max-w-3xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Your Custom Game</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GameCard
              name="My Custom Game"
              questionCount={customGame.length}
              onPlay={() => playGame(customGame)}
              onViewAnswers={() => viewAnswers(customGame, 'My Custom Game')}
              highlight
            />
          </div>
        </section>
      )}

      <section className="w-full max-w-3xl flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Default Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gameData.games.map((game) => (
            <GameCard
              key={game.id}
              name={game.name}
              questionCount={game.questions.length}
              onPlay={() => playGame(game.questions)}
              onViewAnswers={() => viewAnswers(game.questions, game.name)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default SelectGame;
