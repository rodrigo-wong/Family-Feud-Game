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

function GameCard({ name, questionCount, onClick, highlight }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-gray-900 border-2 rounded-2xl p-4 cursor-pointer transition hover:bg-white/10 ${
        highlight ? 'border-yellow-400' : 'border-white'
      }`}
    >
      <p className="text-xl font-bold">{name}</p>
      <p className="text-white/60 text-sm mt-1">
        {questionCount} question{questionCount === 1 ? '' : 's'}
      </p>
    </button>
  );
}

function SelectGame() {
  const navigate = useNavigate();
  const customGame = loadCustomGame();

  const selectGame = (questions) => {
    localStorage.setItem('familyFeudQuestions', JSON.stringify(questions));
    navigate('/', { state: { stage: 'teamNames' } });
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-10 text-white">
      <h1 className="text-4xl font-bold">Select a Game</h1>

      {customGame && (
        <section className="w-full max-w-3xl flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Your Custom Game</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GameCard
              name="My Custom Game"
              questionCount={customGame.length}
              onClick={() => selectGame(customGame)}
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
              onClick={() => selectGame(game.questions)}
            />
          ))}
        </div>
      </section>

      <Link to="/" className="text-white/70 hover:text-white underline">
        Back to Home
      </Link>
    </div>
  );
}

export default SelectGame;
