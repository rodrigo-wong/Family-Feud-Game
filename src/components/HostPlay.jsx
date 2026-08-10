import { useState, useMemo } from 'react';
import logo from '../assets/family-feud-logo.png';
import yesSound from '../assets/sounds/yes.mp3';
import noSound from '../assets/sounds/no.mp3';
import intenseSound from '../assets/sounds/intense.mp3';
import drumSound from '../assets/sounds/drum.mp3';
import overSound from '../assets/sounds/over.mp3';
import winGif from '../assets/gif/win.gif';
import { playSound } from '../utils/audio';
import x from '../assets/x.png';
import Fireworks from './Fireworks';
import './Play.css';

const SLOT_COUNT = 8;

function Play() {
    const [teamOneScore, setTeamOneScore] = useState(0);
    const [teamTwoScore, setTeamTwoScore] = useState(0);

    // Step sequence per question: 'logo' -> 'question' -> 'board' -> 'assign'
    const [step, setStep] = useState('logo');
    const [strikes, setStrikes] = useState(0);
    const [revealed, setRevealed] = useState(() => new Set());
    const [questionIndex, setQuestionIndex] = useState(0);

    const [game] = useState(() => {
        try {
            const stored = localStorage.getItem('familyFeudQuestions');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [teamNames] = useState(() => {
        try {
            const stored = localStorage.getItem('familyFeudTeamNames');
            const parsed = stored ? JSON.parse(stored) : null;
            return {
                team1: parsed?.team1 || 'Team 1',
                team2: parsed?.team2 || 'Team 2',
            };
        } catch {
            return { team1: 'Team 1', team2: 'Team 2' };
        }
    });

    const isGameOver = questionIndex >= game.length && game.length > 0;
    const currentQuestion = game[questionIndex]?.text ?? '';
    const currentAnswers = useMemo(() => game[questionIndex]?.answers ?? [], [game, questionIndex]);

    const currentBoardPoints = useMemo(() => {
        return currentAnswers.reduce(
            (sum, a, i) => (revealed.has(i) ? sum + (Number(a.points) || 0) : sum),
            0
        );
    }, [currentAnswers, revealed]);

    const toggleAnswer = (index) => {
        if (!currentAnswers[index]) return;
        setRevealed((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                playSound(yesSound);
                next.add(index);
            }
            return next;
        });
    };

    const awardPointsToTeam = (team) => {
        if (team === 1) setTeamOneScore((prev) => prev + currentBoardPoints);
        if (team === 2) setTeamTwoScore((prev) => prev + currentBoardPoints);

        // After awarding points, advance to the next question or game over
        handleNext();
    };

    const resetQuestionState = () => {
        setRevealed(new Set());
        setStrikes(0);
    };

    // Sequence controller for "Next" button
    const handleNext = () => {
        if (isGameOver) return;

        if (step === 'logo') {
            setStep('question');
        } else if (step === 'question') {
            setStep('board');
        } else if (step === 'board') {
            setStep('assign');
        } else if (step === 'assign') {
            if (questionIndex < game.length - 1) {
                setQuestionIndex((prev) => prev + 1);
                resetQuestionState();
                setStep('logo');
            } else {
                setQuestionIndex(game.length);
                setStep('gameOver');
                playSound(overSound);
            }
        }
    };

    // Sequence controller for "Previous" button
    const handlePrev = () => {
        if (isGameOver) {
            setQuestionIndex(game.length - 1);
            setStep('assign');
            return;
        }

        if (step === 'assign') {
            setStep('board');
        } else if (step === 'board') {
            setStep('question');
        } else if (step === 'question') {
            setStep('logo');
        } else if (step === 'logo') {
            if (questionIndex > 0) {
                setQuestionIndex((prev) => prev - 1);
                resetQuestionState();
                setStep('assign');
            }
        }
    };

    const handleStrike = (count) => {
        playSound(noSound);
        setStrikes(count);
        setTimeout(() => setStrikes(0), 2000);
    };

    return (
        <div className="relative flex flex-col items-center h-screen overflow-hidden px-4 py-4 text-white">
            <Fireworks active={isGameOver} />

            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4">
                <div className="w-full">
                    {/* Board Grid */}
                    <div className="relative">
                        <div className="ff-panel relative bg-black/70 border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)]">
                            <div className="grid grid-cols-1 grid-rows-8 grid-flow-col">
                                {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                                    const answer = currentAnswers[i];
                                    const isRevealed = revealed.has(i);

                                    return (
                                        <div
                                            key={i}
                                            className="m-0.5 rounded-md border-4 border-black bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 p-1"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleAnswer(i)}
                                                disabled={!answer || isGameOver}
                                                className={`relative w-full h-12 rounded-sm overflow-hidden flex gap-1 shadow-md transition-colors duration-300 ${
                                                    answer ? 'cursor-pointer hover:brightness-110' : 'cursor-default opacity-50'
                                                }`}
                                            >
                                                {answer ? (
                                                    <>
                                                        {/* Number Slot */}
                                                        <span
                                                            className={`shrink-0 w-12 h-full flex items-center justify-center font-extrabold text-white text-lg transition-colors duration-300 ${
                                                                isRevealed
                                                                    ? 'bg-[linear-gradient(to_bottom,#059669_0%,#047857_100%)] border-r border-emerald-400'
                                                                    : 'bg-[linear-gradient(to_bottom,#334155_0%,#1e293b_100%)] border-r border-gray-600'
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </span>

                                                        {/* Answer Text Area */}
                                                        <span
                                                            className={`flex-1 h-full flex items-center px-4 transition-colors duration-300 ${
                                                                isRevealed
                                                                    ? 'bg-[linear-gradient(to_bottom,#059669_0%,#047857_100%)]'
                                                                    : 'bg-[linear-gradient(to_bottom,#1e293b_0%,#0f172a_100%)]'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`ff-answer-font font-extrabold uppercase truncate transition-colors duration-300 ${
                                                                    isRevealed ? 'text-white' : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {answer.text}
                                                            </span>
                                                        </span>

                                                        {/* Answer Points Area */}
                                                        <span
                                                            className={`shrink-0 w-16 h-full flex items-center justify-center transition-colors duration-300 ${
                                                                isRevealed
                                                                    ? 'bg-[linear-gradient(to_bottom,#34d399_0%,#059669_100%)]'
                                                                    : 'bg-[linear-gradient(to_bottom,#334155_0%,#1e293b_100%)]'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`ff-num-font font-extrabold transition-colors duration-300 ${
                                                                    isRevealed ? 'text-white' : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {answer.points}
                                                            </span>
                                                        </span>
                                                    </>
                                                ) : (
                                                    /* Empty Slot */
                                                    <span className="w-full h-full bg-[#0d1524] flex items-center justify-center text-gray-600 font-bold">
                                                        ---
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sequential Overlays */}
                        {step === 'logo' && (
                            <div className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 flex flex-col items-center justify-center gap-6 z-40">
                                <img src={logo} alt="Family Feud logo" className="max-h-full max-w-full object-contain" />
                            </div>
                        )}

                        {step === 'question' && (
                            <div className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 flex flex-col items-center justify-center p-6 z-40">
                                <p className="ff-display-font text-center text-white font-bold">
                                    {currentQuestion || 'No question set available.'}
                                </p>
                            </div>
                        )}

                        {step === 'assign' && (
                            <div className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 flex flex-col items-center justify-center gap-6 z-40">
                                <p className="ff-display-font text-center text-white font-bold">
                                    Award {currentBoardPoints} points to:
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => awardPointsToTeam(1)}
                                        className="rounded-xl px-6 py-3 font-bold bg-green-600 hover:bg-green-500 text-white transition cursor-pointer"
                                    >
                                        {teamNames.team1} (+{currentBoardPoints})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => awardPointsToTeam(2)}
                                        className="rounded-xl px-6 py-3 font-bold bg-green-600 hover:bg-green-500 text-white transition cursor-pointer"
                                    >
                                        {teamNames.team2} (+{currentBoardPoints})
                                    </button>
                                </div>
                            </div>
                        )}

                        {isGameOver && (
                            <div className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 flex flex-col items-center justify-center gap-6 z-40">
                                <p className="ff-display-font text-white font-extrabold">
                                    {teamOneScore === teamTwoScore
                                        ? "It's a tie!"
                                        : `${teamOneScore > teamTwoScore ? teamNames.team1 : teamNames.team2} wins!`}
                                </p>
                                <img src={winGif} alt="Winner celebration" className="ff-win-gif object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Question Counter */}
                {game.length > 0 && !isGameOver && (
                    <span className="text-white/60 text-sm">
                        Question {questionIndex + 1} of {game.length} • Step: {step.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Host Controls */}
            <div className="relative z-50 flex flex-wrap items-center justify-center gap-4 pb-2 bg-gray-900/90 p-3 rounded-2xl border border-white/20">
                {/* Step Sequence Navigation */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={questionIndex === 0 && step === 'logo'}
                        className="rounded-xl px-4 py-2 font-bold bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        ← Previous
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={isGameOver}
                        className="rounded-xl px-4 py-2 font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        Next →
                    </button>
                </div>

                {/* Sound Effects & Strikes */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => playSound(intenseSound)}
                        className="rounded-xl px-3 py-2 text-xl bg-gray-800 hover:bg-gray-700 cursor-pointer"
                        title="Intense Sound"
                    >
                        🔥
                    </button>
                    <button
                        type="button"
                        onClick={() => playSound(drumSound)}
                        className="rounded-xl px-3 py-2 text-xl bg-gray-800 hover:bg-gray-700 cursor-pointer"
                        title="Drumroll"
                    >
                        🥁
                    </button>

                    {[1, 2, 3].map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => handleStrike(val)}
                            className="rounded-full border-2 border-red-600 px-3 py-1 font-black text-red-500 bg-gray-900 hover:bg-red-950 transition cursor-pointer"
                        >
                            {'X'.repeat(val)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Strikes Overlay */}
            {strikes > 0 && (
                <div className="fixed inset-0 flex items-center justify-center gap-6 bg-black/60 z-50 pointer-events-none">
                    {Array.from({ length: strikes }).map((_, i) => (
                        <span key={i} className="text-[12rem] font-black text-red-600">
                            <img src={x} alt="Strike" className="w-48 h-48 object-contain" />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Play;