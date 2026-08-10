import {useState, useMemo, useEffect, useCallback, useRef} from 'react';
import logo from '../assets/family-feud-logo.png';
import winGif from '../assets/gif/win.gif';
import x from '../assets/x.png';
import Fireworks from './Fireworks';
import FitText from './FitText';
import './Play.css';
import {io} from "socket.io-client";
import { useSearchParams } from 'react-router-dom';

const socket = io(import.meta.env.VITE_BACKEND_URL);

const SLOT_COUNT = 8;
const TEAM_NAMES_DEBOUNCE_MS = 2000;

function Play() {
    // FIX: Destructure the array returned by useSearchParams
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');

    useEffect(() => {
        if (!roomId) return;

        socket.emit('join_channel', {roomId: roomId, role: 'host'});

    }, [roomId]); // Room ID won't change, so this listener stays active continuously

    // Broadcasts a one-off action (e.g. a sound cue) to the display view.
    // Persistent state changes are instead broadcast by the STATE_UPDATE effect below,
    // so the display self-heals even if an individual action event is dropped.
    const emitAction = useCallback((action) => {
        if (!roomId) return;
        socket.emit('send_action', {channel: roomId, action});
    }, [roomId]);

    const [teamOneScore, setTeamOneScore] = useState(0);
    const [teamTwoScore, setTeamTwoScore] = useState(0);

    // Step sequence: 'teamNames' -> 'logo' -> 'question' -> 'board' -> 'assign' -> ('reveal') -> ...
    const [step, setStep] = useState('teamNames');
    const [strikes, setStrikes] = useState(0);
    const [revealed, setRevealed] = useState(() => new Set());
    const [questionIndex, setQuestionIndex] = useState(0);

    // Falls back to this device's own localStorage (e.g. testing host + display in the
    // same browser); the real data for a phone that scanned the QR code arrives via the
    // GAME_DATA_SYNC socket action below, since that phone never had it in localStorage.
    const [game, setGame] = useState(() => {
        try {
            const stored = localStorage.getItem('familyFeudQuestions');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Always start fresh with default team names instead of restoring a previous
    // session's names from localStorage.
    const [teamNames, setTeamNames] = useState({ team1: 'Team 1', team2: 'Team 2' });
    const [teamOneNameInput, setTeamOneNameInput] = useState(teamNames.team1);
    const [teamTwoNameInput, setTeamTwoNameInput] = useState(teamNames.team2);

    // Picks up team name edits made on the display view (Play.jsx) and mirrors them here,
    // including the still-in-progress draft inputs on the teamNames step.
    useEffect(() => {
        if (!roomId) return;

        const handleReceiveAction = ({action}) => {
            if (action?.type === 'GAME_DATA_SYNC') {
                const questions = action.payload?.questions;
                if (Array.isArray(questions)) setGame(questions);
                return;
            }

            if (action?.type !== 'TEAM_NAMES_UPDATE') return;
            const nextTeamNames = action.payload?.teamNames;
            if (!nextTeamNames) return;

            setTeamNames(nextTeamNames);
            setTeamOneNameInput(nextTeamNames.team1);
            setTeamTwoNameInput(nextTeamNames.team2);
        };

        socket.on('receive_action', handleReceiveAction);

        return () => {
            socket.off('receive_action', handleReceiveAction);
        };
    }, [roomId]);

    // Tracks whether the pending draft-input change was typed here (vs. arriving from the
    // socket), so we only broadcast edits made on this view and never echo back a synced one.
    const localTeamNamesEditRef = useRef(false);

    const handleTeamNameInputChange = (key, value) => {
        localTeamNamesEditRef.current = true;
        if (key === 'team1') setTeamOneNameInput(value);
        else setTeamTwoNameInput(value);
    };

    // Broadcasts the in-progress draft to the display view as the host types,
    // so Play.jsx can show a live preview before "Continue" is clicked.
    useEffect(() => {
        if (!roomId || !localTeamNamesEditRef.current) return;

        const timer = setTimeout(() => {
            localTeamNamesEditRef.current = false;
            emitAction({
                type: 'TEAM_NAMES_UPDATE',
                payload: {teamNames: {team1: teamOneNameInput, team2: teamTwoNameInput}},
            });
        }, TEAM_NAMES_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [roomId, teamOneNameInput, teamTwoNameInput, emitAction]);

    const isGameOver = questionIndex >= game.length && game.length > 0;
    const currentQuestion = game[questionIndex]?.text ?? '';
    const currentAnswers = useMemo(() => game[questionIndex]?.answers ?? [], [game, questionIndex]);

    const currentBoardPoints = useMemo(() => {
        return currentAnswers.reduce(
            (sum, a, i) => (revealed.has(i) ? sum + (Number(a.points) || 0) : sum),
            0
        );
    }, [currentAnswers, revealed]);

    // Broadcasts the full game state to the display view any time it changes,
    // so Play.jsx can mirror it without duplicating the host's step logic.
    useEffect(() => {
        if (!roomId) return;
        emitAction({
            type: 'STATE_UPDATE',
            payload: {
                step,
                questionIndex,
                revealed: Array.from(revealed),
                strikes,
                teamOneScore,
                teamTwoScore,
                teamNames,
            },
        });
    }, [roomId, step, questionIndex, revealed, strikes, teamOneScore, teamTwoScore, teamNames, emitAction]);

    // Plays the intro music on the display whenever the team-names section is entered
    useEffect(() => {
        if (!roomId || step !== 'teamNames') return;
        emitAction({type: 'PLAY_SOUND', payload: {sound: 'intro'}});
    }, [roomId, step, emitAction]);

    const handleSetTeamNames = () => {
        const nextTeamNames = {
            team1: teamOneNameInput.trim() || 'Team 1',
            team2: teamTwoNameInput.trim() || 'Team 2',
        };
        setTeamNames(nextTeamNames);
        setStep('logo');
    };

    const toggleAnswer = (index) => {
        if (!currentAnswers[index]) return;
        setRevealed((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                emitAction({type: 'PLAY_SOUND', payload: {sound: 'yes'}});
                next.add(index);
            }
            return next;
        });
    };

    const resetQuestionState = () => {
        setRevealed(new Set());
        setStrikes(0);
    };

    // Advances past the current question once all its answers are revealed
    const advanceQuestion = () => {
        if (questionIndex < game.length - 1) {
            setQuestionIndex((prev) => prev + 1);
            resetQuestionState();
            setStep('logo');
        } else {
            setQuestionIndex(game.length);
            setStep('gameOver');
            emitAction({type: 'PLAY_SOUND', payload: {sound: 'over'}});
        }
    };

    const awardPointsToTeam = (team) => {
        if (team === 1) setTeamOneScore((prev) => prev + currentBoardPoints);
        if (team === 2) setTeamTwoScore((prev) => prev + currentBoardPoints);

        // Reveal any remaining answers one by one before moving on
        const hasUnrevealed = currentAnswers.some((_, i) => !revealed.has(i));
        if (hasUnrevealed) {
            setStep('reveal');
        } else {
            advanceQuestion();
        }
    };

    // Sequence controller for "Next" button
    const handleNext = () => {
        if (isGameOver) return;

        if (step === 'logo') {
            setStep('question');
        } else if (step === 'question') {
            setStep('board');
        } else if (step === 'reveal') {
            const nextIndex = currentAnswers.findIndex((_, i) => !revealed.has(i));
            if (nextIndex !== -1) {
                setRevealed((prev) => new Set(prev).add(nextIndex));
            } else {
                advanceQuestion();
            }
        } else if (step === 'board') {
            setStep('assign');
        }
    };

    // Sequence controller for "Previous" button
    const handlePrev = () => {
        if (isGameOver) {
            setQuestionIndex(game.length - 1);
            setStep('assign');
            return;
        }

        if (step === 'reveal') {
            setStep('assign');
        } else if (step === 'assign') {
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
            } else {
                setStep('teamNames');
            }
        }
    };

    const handleStrike = (count) => {
        emitAction({type: 'PLAY_SOUND', payload: {sound: 'no'}});
        setStrikes(count);
        setTimeout(() => setStrikes(0), 2000);
    };

    if (step === 'teamNames') {
        return (
            <div className="relative flex flex-col items-center h-dvh w-full overflow-y-auto p-4 text-white">
                <div className="m-auto flex flex-col items-center">
                    <img src={logo} alt="Family Feud logo" className="max-h-[min(16rem,30vh)] max-w-full object-contain mb-8 shrink-0" />
                    <div className="flex flex-col items-center gap-4 w-full max-w-md shrink-0">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                            <input
                                type="text"
                                value={teamOneNameInput}
                                onChange={(e) => handleTeamNameInputChange('team1', e.target.value)}
                                placeholder="Team 1"
                                maxLength={20}
                                className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                            />
                            <input
                                type="text"
                                value={teamTwoNameInput}
                                onChange={(e) => handleTeamNameInputChange('team2', e.target.value)}
                                placeholder="Team 2"
                                maxLength={20}
                                className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSetTeamNames}
                            className="block text-center text-3xl font-bold bg-yellow-600 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center h-dvh w-full overflow-hidden px-4 pt-4 text-white">
            <Fireworks active={isGameOver} />

            <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center">
                <div className="m-auto flex flex-col items-center gap-4 w-full py-2">
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
                                                            <span className="w-full h-6">
                                                                <FitText
                                                                    text={answer.text.toUpperCase()}
                                                                    className={`font-extrabold transition-colors duration-300 ${
                                                                        isRevealed ? 'text-white' : 'text-gray-400'
                                                                    }`}
                                                                />
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
                                <div className="flex flex-wrap items-center justify-center gap-4 px-4 max-w-full">
                                    <button
                                        type="button"
                                        onClick={() => awardPointsToTeam(1)}
                                        className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold bg-green-600 hover:bg-green-500 text-white transition cursor-pointer max-w-full"
                                    >
                                        <span className="w-24 min-w-0 whitespace-normal break-words leading-tight text-center font-extrabold">{teamNames.team1}</span>
                                        <span className="shrink-0">(+{currentBoardPoints})</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => awardPointsToTeam(2)}
                                        className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold bg-green-600 hover:bg-green-500 text-white transition cursor-pointer max-w-full"
                                    >
                                        <span className="w-24 min-w-0 whitespace-normal break-words leading-tight text-center font-extrabold">{teamNames.team2}</span>
                                        <span className="shrink-0">(+{currentBoardPoints})</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isGameOver && (
                            <div className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 flex flex-col items-center justify-center gap-6 z-40">
                                <div className="w-full max-w-xl h-12">
                                    <FitText
                                        text={
                                            teamOneScore === teamTwoScore
                                                ? "It's a tie!"
                                                : `${teamOneScore > teamTwoScore ? teamNames.team1 : teamNames.team2} wins!`
                                        }
                                        className="font-extrabold text-white"
                                    />
                                </div>
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
            </div>

            {/* Host Controls */}
            <div className="relative z-50 shrink-0 flex flex-wrap items-center justify-center gap-4 my-2 bg-gray-900/90 p-3 rounded-2xl border border-white/20">
                {/* Step Sequence Navigation */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="rounded-xl px-4 py-2 font-bold bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        ← Previous
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={isGameOver || step === 'assign'}
                        className="rounded-xl px-4 py-2 font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        Next →
                    </button>
                </div>

                {/* Sound Effects & Strikes */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => emitAction({type: 'PLAY_SOUND', payload: {sound: 'intense'}})}
                        className="rounded-xl px-3 py-2 text-xl bg-gray-800 hover:bg-gray-700 cursor-pointer"
                        title="Intense Sound"
                    >
                        🔥
                    </button>
                    <button
                        type="button"
                        onClick={() => emitAction({type: 'PLAY_SOUND', payload: {sound: 'drum'}})}
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