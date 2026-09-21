import {useCallback, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {io} from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL);

const seatStorageKey = (roomId) => `familyFeudBuzzerSeat:${roomId}`;

// A device keeps its own seat across a refresh (same team, same playerId) so reloading
// the page doesn't kick itself off its own team's seat.
function readStoredSeat(roomId) {
    if (!roomId) return null;
    try {
        const stored = sessionStorage.getItem(seatStorageKey(roomId));
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function Buzzer() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');

    const [playerId] = useState(() => readStoredSeat(roomId)?.playerId ?? crypto.randomUUID());
    const [team, setTeam] = useState(() => readStoredSeat(roomId)?.team ?? null);
    const [teamNames, setTeamNames] = useState({team1: 'Team 1', team2: 'Team 2'});
    const [buzzerSeats, setBuzzerSeats] = useState({team1: null, team2: null});
    const [buzzWinner, setBuzzWinner] = useState(null);
    const [step, setStep] = useState(null);

    // The server echoes send_action back to the sender as well as other room members, so
    // every outgoing action is tagged with its origin and self-echoes are ignored below.
    const emitAction = useCallback((action) => {
        if (!roomId) return;
        socket.emit('send_action', {channel: roomId, action: {...action, from: 'buzzer'}});
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;

        const joinRoom = () => {
            socket.emit('join_channel', {roomId, role: 'buzzer'});
            if (team) {
                emitAction({type: 'BUZZ_CLAIM_SEAT', payload: {team, playerId}});
            }
        };

        const handleReceiveAction = ({action}) => {
            if (!action || action.from === 'buzzer') return;
            if (action.type !== 'STATE_UPDATE') return;

            const {
                teamNames: nextTeamNames,
                buzzerSeats: nextBuzzerSeats,
                buzzWinner: nextBuzzWinner,
                step: nextStep,
            } = action.payload ?? {};
            if (nextTeamNames) setTeamNames(nextTeamNames);
            if (nextBuzzerSeats) setBuzzerSeats(nextBuzzerSeats);
            setBuzzWinner(nextBuzzWinner ?? null);
            setStep(nextStep ?? null);
        };

        socket.on('receive_action', handleReceiveAction);
        socket.on('connect', joinRoom);
        joinRoom();

        return () => {
            socket.off('receive_action', handleReceiveAction);
            socket.off('connect', joinRoom);
        };
    }, [roomId, team, playerId, emitAction]);

    // Claims (or re-claims) this device's team seat whenever a team is selected. The host
    // always overwrites on claim, so a later scan for the same team simply takes over.
    useEffect(() => {
        if (!roomId || !team) return;

        try {
            sessionStorage.setItem(seatStorageKey(roomId), JSON.stringify({team, playerId}));
        } catch {
            // Storage may be unavailable (e.g. private browsing); the seat still works for
            // this session, it just won't survive a refresh.
        }

        emitAction({type: 'BUZZ_CLAIM_SEAT', payload: {team, playerId}});
    }, [roomId, team, playerId, emitAction]);

    // Socket.IO only reports a disconnect to the server and the disconnected device.
    // A heartbeat lets the display expire this buzzer's QR status after a sleep or loss
    // of network connectivity.
    useEffect(() => {
        if (!roomId || !team) return;

        const announcePresence = () => {
            emitAction({type: 'BUZZER_HEARTBEAT', payload: {team, playerId}});
        };

        announcePresence();
        const interval = setInterval(announcePresence, 10_000);
        return () => clearInterval(interval);
    }, [roomId, team, playerId, emitAction]);

    const seatTeamKey = team ? `team${team}` : null;
    const hasBeenReplaced = !!seatTeamKey && !!buzzerSeats[seatTeamKey] && buzzerSeats[seatTeamKey] !== playerId;

    const canBuzz = step === 'question';

    const handleBuzz = () => {
        if (!team || hasBeenReplaced || buzzWinner || !canBuzz) return;
        emitAction({type: 'BUZZ_PRESS', payload: {team}});
    };

    const handleChangeTeam = () => {
        setTeam(null);
        try {
            sessionStorage.removeItem(seatStorageKey(roomId));
        } catch {
            // Ignore — worst case the old team is pre-selected next time.
        }
    };

    if (!roomId) return null;

    if (!team) {
        return (
            <div className="min-h-dvh w-full flex flex-col items-center justify-center gap-6 p-6 text-white">
                <p className="text-2xl font-bold text-center">Which team are you on?</p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button
                        type="button"
                        onClick={() => setTeam(1)}
                        className="rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900 px-6 py-6 text-xl font-extrabold hover:brightness-110 transition cursor-pointer"
                    >
                        {teamNames.team1}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTeam(2)}
                        className="rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-red-500 via-red-700 to-red-900 px-6 py-6 text-xl font-extrabold hover:brightness-110 transition cursor-pointer"
                    >
                        {teamNames.team2}
                    </button>
                </div>
            </div>
        );
    }

    if (hasBeenReplaced) {
        return (
            <div className="min-h-dvh w-full flex flex-col items-center justify-center gap-4 p-6 text-white text-center">
                <p className="text-xl font-bold">Another device took over this team's buzzer.</p>
                <button
                    type="button"
                    onClick={handleChangeTeam}
                    className="rounded-xl border-2 border-white px-4 py-2 font-bold hover:bg-gray-800 transition cursor-pointer"
                >
                    Rejoin
                </button>
            </div>
        );
    }

    const teamColor = team === 1
        ? 'from-blue-500 via-blue-700 to-blue-900'
        : 'from-red-500 via-red-700 to-red-900';
    const iWon = buzzWinner === team;
    const someoneElseWon = !!buzzWinner && buzzWinner !== team;

    return (
        <div className="min-h-dvh w-full flex flex-col items-center justify-center gap-6 p-6 text-white">
            <p className="text-lg font-bold text-white/80">{teamNames[seatTeamKey]}</p>
            <button
                type="button"
                onClick={handleBuzz}
                disabled={!!buzzWinner || !canBuzz}
                className={`w-64 h-64 rounded-full border-8 border-yellow-400 bg-gradient-to-b ${teamColor} text-4xl font-black shadow-[0_0_60px_rgba(250,204,21,0.4)] transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
            >
                BUZZ
            </button>
            {!buzzWinner && !canBuzz && (
                <p className="text-sm text-white/50">Waiting for the question…</p>
            )}
            {iWon && <p className="text-2xl font-extrabold text-yellow-300">You buzzed in first!</p>}
            {someoneElseWon && (
                <p className="text-xl font-bold text-white/70">{teamNames[`team${buzzWinner}`]} buzzed in first.</p>
            )}
            <button
                type="button"
                onClick={handleChangeTeam}
                className="text-sm text-white/50 underline cursor-pointer"
            >
                Not your team? Switch
            </button>
        </div>
    );
}

export default Buzzer;
