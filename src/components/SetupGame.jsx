import { useState } from 'react';
import { Link } from 'react-router-dom';

const makeAnswer = () => ({ id: crypto.randomUUID(), text: '', points: '' });

const makeQuestion = () => ({
  id: crypto.randomUUID(),
  text: '',
  answers: [makeAnswer(), makeAnswer(), makeAnswer(), makeAnswer()],
});

const loadStoredQuestions = () => {
  try {
    const stored = localStorage.getItem('familyFeudCustomGame');
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [makeQuestion()];
  } catch {
    return [makeQuestion()];
  }
};

function SetupGame() {
  const [questions, setQuestions] = useState(loadStoredQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const currentQuestion = questions[currentIndex];

  const updateQuestionText = (questionId, text) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, text } : q))
    );
  };

  const updateAnswer = (questionId, answerId, field, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, [field]: value } : a
              ),
            }
      )
    );
  };

  const addAnswer = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, answers: [...q.answers, makeAnswer()] } : q
      )
    );
  };

  const removeAnswer = (questionId, answerId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId || q.answers.length <= 1
          ? q
          : { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
      )
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => {
      const next = [...prev, makeQuestion()];
      setCurrentIndex(next.length - 1);
      return next;
    });
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      const removedIndex = prev.findIndex((q) => q.id === questionId);
      const next = prev.filter((q) => q.id !== questionId);
      setCurrentIndex((ci) =>
        Math.min(removedIndex < ci ? ci - 1 : ci, next.length - 1)
      );
      return next;
    });
  };

  const goToQuestion = (index) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));

  const handleSubmit = (e) => {
    e.preventDefault();

    const sorted = questions
      .map((q) => ({
        ...q,
        answers: q.answers
          .filter((a) => a.text.trim())
          .map((a) => ({ ...a, points: Number(a.points) || 0 }))
          .sort((a, b) => b.points - a.points),
      }))
      .filter((q) => q.text.trim() && q.answers.length > 0);

    localStorage.setItem('familyFeudCustomGame', JSON.stringify(sorted));
    localStorage.setItem('familyFeudQuestions', JSON.stringify(sorted));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const clearSavedGame = () => {
    if (!window.confirm('Clear the saved game? This cannot be undone.')) return;
    localStorage.removeItem('familyFeudCustomGame');
    localStorage.removeItem('familyFeudQuestions');
    setQuestions([makeQuestion()]);
    setCurrentIndex(0);
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-8 text-white">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-lg font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
      >
        ← Home
      </Link>

      <h1 className="text-4xl font-bold">Setup Game</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full">
        <div className="flex items-center gap-2 sm:gap-4 w-full max-w-6xl">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="text-3xl px-2 py-8 cursor-pointer hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Previous question"
          >
            ‹‹
          </button>

          <div className="flex-1 min-w-0 bg-gray-900 border-2 border-white rounded-2xl p-4 flex flex-col gap-4 text-2xl">
            <div className="flex items-center gap-2">
              <label className="font-bold whitespace-nowrap">Q{currentIndex + 1}.</label>
              <input
                type="text"
                value={currentQuestion.text}
                onChange={(e) => updateQuestionText(currentQuestion.id, e.target.value)}
                placeholder="Enter question"
                className="flex-1 bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-1 py-1"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(currentQuestion.id)}
                  className="text-red-400 hover:text-red-300 cursor-pointer px-2"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {currentQuestion.answers.map((answer, aIndex) => (
                <div key={answer.id} className="flex items-center gap-2">
                  <span className="w-5 text-white/60">{aIndex + 1}.</span>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) =>
                      updateAnswer(currentQuestion.id, answer.id, 'text', e.target.value)
                    }
                    placeholder="Answer"
                    className="flex-1 bg-transparent border-b border-white/30 focus:border-white outline-none px-1 py-1"
                  />
                  <input
                    type="number"
                    value={answer.points}
                    onChange={(e) =>
                      updateAnswer(currentQuestion.id, answer.id, 'points', e.target.value)
                    }
                    placeholder="Pts"
                    min="0"
                    className="w-16 bg-transparent border-b border-white/30 focus:border-white outline-none px-1 py-1 text-center"
                  />
                  {currentQuestion.answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(currentQuestion.id, answer.id)}
                      className="text-red-400 hover:text-red-300 cursor-pointer px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addAnswer(currentQuestion.id)}
              className="self-start text-sm text-white/70 hover:text-white cursor-pointer"
            >
              + Add answer
            </button>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="text-3xl px-2 py-8 cursor-pointer hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Next question"
          >
            ››
          </button>
        </div>

        <div className="flex items-center gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => goToQuestion(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                i === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <p className="text-white/60 text-sm -mt-4">
          Question {currentIndex + 1} of {questions.length}
        </p>

        <button
          type="button"
          onClick={addQuestion}
          className="border-2 border-white rounded-2xl px-4 py-2 cursor-pointer hover:bg-white/10"
        >
          + Add question
        </button>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-gray-900 border-2 border-white rounded-2xl px-6 py-2 text-2xl cursor-pointer hover:bg-white/10"
          >
            Save
          </button>
          <Link
            to="/answers"
            className="bg-gray-900 border-2 border-white rounded-2xl px-6 py-2 text-2xl cursor-pointer hover:bg-white/10"
          >
            View Answers
          </Link>
          <button
            type="button"
            onClick={clearSavedGame}
            className="bg-gray-900 border-2 border-red-500 text-red-400 rounded-2xl px-6 py-2 text-2xl cursor-pointer hover:bg-red-950"
          >
            Clear Saved Game
          </button>
        </div>
        {justSaved && <p className="text-green-400 -mt-2">Saved!</p>}
      </form>
    </div>
  );
}

export default SetupGame;
