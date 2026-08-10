import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {io} from 'socket.io-client';
import logo from '../assets/family-feud-logo.png';
import introSound from '../assets/sounds/introduction.mp3';
import yesSound from '../assets/sounds/yes.mp3';
import noSound from '../assets/sounds/no.mp3';
import intenseSound from '../assets/sounds/intense.mp3';
import drumSound from '../assets/sounds/drum.mp3';
import overSound from '../assets/sounds/over.mp3';
import winGif from '../assets/gif/win.gif';
import {playSound} from '../utils/audio';
import x from '../assets/x.png';
import Fireworks from './Fireworks';
import './Play.css';
import VolumeControl from "./VolumeControl.jsx";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const SLOT_COUNT = 8;
const TEAM_NAMES_DEBOUNCE_MS = 2000;

const SOUND_MAP = {
    intro: introSound,
    yes: yesSound,
    no: noSound,
    over: overSound,
    intense: intenseSound,
    drum: drumSound,
};

function Play() {
    const location = useLocation();
    const roomId = location.state?.roomId;

    const [teamOneScore, setTeamOneScore] = useState(0);
    const [teamTwoScore, setTeamTwoScore] = useState(0);
    // Mirrors HostPlay's step sequence: 'teamNames' -> 'logo' -> 'question' -> 'board' -> 'assign' -> 'gameOver'
    const [step, setStep] = useState('teamNames');
    const [strikes, setStrikes] = useState(0);
    const [revealed, setRevealed] = useState(() => new Set());
    const [questionIndex, setQuestionIndex] = useState(0);
    const [teamNames, setTeamNames] = useState({team1: 'Team 1', team2: 'Team 2'});

    const [game] = useState(() => {
        try {
            const stored = localStorage.getItem('familyFeudQuestions');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const currentQuestion = game[questionIndex]?.text ?? '';
    const currentAnswers = useMemo(
        () => game[questionIndex]?.answers ?? [],
        [game, questionIndex]
    );
    const boardPoints = currentAnswers.reduce(
        (sum, a, i) => (revealed.has(i) ? sum + (Number(a.points) || 0) : sum),
        0
    );

    const emitAction = useCallback((action) => {
        if (!roomId) return;
        socket.emit('send_action', {channel: roomId, action});
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;

        socket.emit('join_channel', {roomId, role: 'display'});

        // The host device only has access to its own localStorage, so it can't see the
        // questions this device saved. Re-push them whenever a host (re)joins the room,
        // e.g. after the initial QR scan or a page refresh on the host's phone.
        const handleUserJoined = (data) => {
            if (data?.role === 'host') {
                socket.emit('send_action', {
                    channel: roomId,
                    action: {type: 'GAME_DATA_SYNC', payload: {questions: game}},
                });
            }
        };
        socket.on('user_joined', handleUserJoined);

        const handleReceiveAction = ({action}) => {
            if (!action) return;

            if (action.type === 'STATE_UPDATE') {
                const {
                    step: nextStep,
                    questionIndex: nextQuestionIndex,
                    revealed: nextRevealed,
                    strikes: nextStrikes,
                    teamOneScore: nextTeamOneScore,
                    teamTwoScore: nextTeamTwoScore,
                    teamNames: nextTeamNames,
                } = action.payload;

                setStep(nextStep);
                setQuestionIndex(nextQuestionIndex);
                setRevealed(new Set(nextRevealed));
                setStrikes(nextStrikes);
                setTeamOneScore(nextTeamOneScore);
                setTeamTwoScore(nextTeamTwoScore);
                if (nextTeamNames) setTeamNames(nextTeamNames);
            } else if (action.type === 'TEAM_NAMES_UPDATE') {
                const nextTeamNames = action.payload?.teamNames;
                if (nextTeamNames) setTeamNames(nextTeamNames);
            } else if (action.type === 'PLAY_SOUND') {
                const sound = SOUND_MAP[action.payload?.sound];
                if (sound) playSound(sound);
            }
        };

        socket.on('receive_action', handleReceiveAction);

        return () => {
            socket.off('user_joined', handleUserJoined);
            socket.off('receive_action', handleReceiveAction);
        };
    }, [roomId, game]);

    // Tracks whether the pending teamNames change was typed here (vs. arriving from the
    // socket), so we only broadcast edits made on this view and never echo back a synced one.
    const localTeamNamesEditRef = useRef(false);

    const handleTeamNameChange = (key, value) => {
        localTeamNamesEditRef.current = true;
        setTeamNames((prev) => ({...prev, [key]: value}));
    };

    useEffect(() => {
        if (!roomId || !localTeamNamesEditRef.current) return;

        const timer = setTimeout(() => {
            localTeamNamesEditRef.current = false;
            emitAction({type: 'TEAM_NAMES_UPDATE', payload: {teamNames}});
        }, TEAM_NAMES_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [roomId, teamNames, emitAction]);

    return (
        <div>
            <VolumeControl/>

            <div className="relative flex flex-col items-center h-screen overflow-hidden px-4 py-4 text-white">
                <Fireworks active={step === 'gameOver'}/>
                <Link
                    to="/"
                    className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-lg font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    ← Home
                </Link>

                <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4 pt-9">
                    <div
                        className="ff-board relative border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)]"
                        style={{
                            borderRadius: '40%',
                            backgroundColor: '#050b24cc',
                            backgroundImage: `radial-gradient(
                circle,
                #ffffff 0px,
                #facc15 1.5px,
                rgba(250, 204, 21, 0.4) 3.5px,
                rgba(250, 204, 21, 0.1) 6px,
                transparent 7px
              )`,
                            backgroundSize: '25px 25px',
                        }}
                    >
                        <div
                            className="ff-points-badge absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center rounded-xl bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-[1.2]">
                            <span className="ff-display-font font-extrabold tracking-wide">{boardPoints}</span>
                        </div>

                        <div
                            className="ff-score-badge ff-score-badge-left absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-md bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 border-4 border-yellow-400 scale-[1.2]">
                            <span className="ff-display-font font-extrabold">{teamOneScore}</span>
                        </div>

                        <div
                            className="ff-score-badge ff-score-badge-right absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-md bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 border-4 border-yellow-400 scale-[1.2]">
                            <span className="ff-display-font font-extrabold">{teamTwoScore}</span>
                        </div>

                        <div className="relative">
                            <div
                                className="ff-panel relative bg-black/70 border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)]">
                                <div className="grid grid-cols-2 grid-rows-4 grid-flow-col">
                                    {Array.from({length: SLOT_COUNT}).map((_, i) => {
                                        const answer = currentAnswers[i];
                                        const isRevealed = revealed.has(i);

                                        return (
                                            <div
                                                key={i}
                                                className="m-0.5 rounded-md border-4 border-black bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 p-1 [perspective:1000px]"
                                            >
                                                <div
                                                    className={`ff-cell-btn relative w-full [transform-style:preserve-3d] transition-transform duration-500 ease-in-out ${
                                                        isRevealed ? '[transform:rotateX(180deg)]' : ''
                                                    }`}
                                                >
                        <span
                            className="absolute inset-0 rounded-sm flex items-center justify-center [backface-visibility:hidden] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] bg-[linear-gradient(to_bottom,#cfe9ff_0%,#4f8bf0_18%,#1a3fa0_55%,#0a1c57_100%)]">
                          {answer && (
                              <span
                                  className="ff-num-circle flex items-center justify-center rounded-[50%]"
                                  style={{
                                      background:
                                          'radial-gradient(ellipse at 35% 25%, #7fbaff 0%, #3a7ce0 35%, #17408f 70%, #081c4d 100%)',
                                      boxShadow:
                                          '0 3px 6px rgba(0,0,0,0.55), inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.35)',
                                  }}
                              >
                              <span
                                  className="ff-num-font font-extrabold text-white"
                                  style={{textShadow: '0 2px 3px rgba(0,0,0,0.65)'}}
                              >
                                {i + 1}
                              </span>
                            </span>
                          )}
                        </span>

                                                    <span
                                                        className="absolute inset-0 rounded-sm overflow-hidden flex gap-1 bg-black [backface-visibility:hidden] [transform:rotateX(180deg)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                          {answer && (
                              <>
                              <span
                                  className="ff-answer-pad flex-1 h-full flex items-center bg-[linear-gradient(to_bottom,#3b5170_0%,#1b2740_55%,#0d1524_100%)]">
                                <span className="ff-answer-font font-extrabold uppercase truncate text-white">
                                  {answer.text}
                                </span>
                              </span>
                                  <span
                                      className="ff-answer-points shrink-0 h-full flex items-center justify-center bg-[linear-gradient(to_bottom,#cfe9ff_0%,#4f8bf0_18%,#1a3fa0_55%,#0a1c57_100%)]">
                                <span className="ff-num-font font-extrabold text-white">
                                  {answer.points}
                                </span>
                              </span>
                              </>
                          )}
                        </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>

                            {step === 'logo' && (
                                <div
                                    className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center gap-6 z-40">
                                    <img src={logo} alt="Family Feud logo"
                                         className="max-h-full max-w-full object-contain"/>
                                </div>
                            )}

                            {step === 'teamNames' && (
                                <div
                                    className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center gap-6 z-40">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md px-4">
                                        <input
                                            type="text"
                                            value={teamNames.team1}
                                            onChange={(e) => handleTeamNameChange('team1', e.target.value)}
                                            placeholder="Team 1"
                                            maxLength={20}
                                            className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                                        />
                                        <input
                                            type="text"
                                            value={teamNames.team2}
                                            onChange={(e) => handleTeamNameChange('team2', e.target.value)}
                                            placeholder="Team 2"
                                            maxLength={20}
                                            className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 'question' && (
                                <div
                                    className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center gap-6 z-40">
                                    <p className="ff-display-font text-center text-white font-bold">
                                        {currentQuestion || 'No question set yet.'}
                                    </p>
                                </div>
                            )}

                            {step === 'assign' && (
                                <div
                                    className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center gap-6 z-40">
                                    <p className="ff-assign-font text-center text-white font-bold">
                                        Award {boardPoints} points to:
                                    </p>
                                    <div className="flex gap-6">
                                        <span
                                            className="ff-assign-btn flex items-center justify-center rounded-xl border-4 border-yellow-400 bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 font-extrabold text-white">
                                            {teamNames.team1}
                                        </span>
                                        <span
                                            className="ff-assign-btn flex items-center justify-center rounded-xl border-4 border-yellow-400 bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 font-extrabold text-white">
                                            {teamNames.team2}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {step === 'gameOver' && (
                                <div
                                    className="ff-overlay absolute inset-0 bg-[#0a1c57] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.35)] flex flex-col items-center justify-center gap-6 z-40">
                                    <p className="ff-display-font text-white font-extrabold">
                                        {teamOneScore === teamTwoScore
                                            ? "It's a tie!"
                                            : `${teamOneScore > teamTwoScore ? teamNames.team1 : teamNames.team2} wins!`}
                                    </p>
                                    <img src={winGif} alt="Winner celebration" className="ff-win-gif object-contain"/>
                                </div>
                            )}
                        </div>
                    </div>

                    {game.length > 0 && (
                        <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-sm">
              Question {questionIndex + 1} of {game.length}
            </span>
                        </div>
                    )}
                </div>

                {strikes > 0 && (
                    <div className="fixed inset-0 flex items-center justify-center gap-6 bg-black/60 z-50">
                        {Array.from({length: strikes}).map((_, i) => (
                            <span key={i} className="text-[12rem] sm:text-[16rem] font-black text-red-600 leading-none">
              <img src={x} alt={i * "x"}/>
            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Play;
