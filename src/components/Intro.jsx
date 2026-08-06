import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from "../assets/family-feud-logo.png";
import introSound from "../assets/sounds/introduction.mp3";
import {useEffect, useRef, useState} from "react";
import { playSound } from '../utils/audio';

function Intro() {
        const navigate = useNavigate();
        const location = useLocation();
        const [stage] = useState(
            location.state?.stage === 'teamNames' ? 'teamNames' : 'menu'
        ); // 'menu' | 'teamNames'
        const [teamOneName, setTeamOneName] = useState('Team 1');
        const [teamTwoName, setTeamTwoName] = useState('Team 2');
        const navigateTimeout = useRef(null);

        const goToPlay = () => {
            localStorage.setItem('familyFeudTeamNames', JSON.stringify({
                team1: teamOneName.trim() || 'Team 1',
                team2: teamTwoName.trim() || 'Team 2',
            }));
            navigate('/play');
        };

        useEffect(() => {
            if (stage !== 'teamNames') return;
            playSound(introSound);
            navigateTimeout.current = setTimeout(goToPlay, 12000);
            return () => clearTimeout(navigateTimeout.current);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [stage]);

        const handleContinue = () => {
            clearTimeout(navigateTimeout.current);
            goToPlay();
        };

        return (
            <div className="relative flex flex-col items-center justify-between h-screen w-full overflow-hidden p-2">
                <div className="flex-1 flex items-center justify-center min-h-0">
                    <img
                        src={logo}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {stage === 'menu' &&
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0 pb-12">
                    <Link
                        to="/select-game"
                        className="block text-center text-2xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        SELECT GAME
                    </Link>
                    <Link
                        to="/setup-game"
                        className="block text-center text-2xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        CUSTOM
                    </Link>
                    <Link
                        to="/instructions"
                        className="block text-center text-2xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        INSTRUCTIONS
                    </Link>
                </div>
                }

                {stage === 'teamNames' &&
                <div className="flex flex-col items-center justify-center gap-4 shrink-0 pb-12 w-full max-w-md px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                        <input
                            type="text"
                            value={teamOneName}
                            onChange={(e) => setTeamOneName(e.target.value)}
                            placeholder="Team 1"
                            maxLength={20}
                            className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                        />
                        <input
                            type="text"
                            value={teamTwoName}
                            onChange={(e) => setTeamTwoName(e.target.value)}
                            placeholder="Team 2"
                            maxLength={20}
                            className="text-center text-xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-4 py-3 text-white w-60 focus:outline-none focus:border-yellow-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="block text-center text-3xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        CONTINUE
                    </button>
                </div>
                }
            </div>
        );
}

export default Intro;
