import { useNavigate, Link } from 'react-router-dom';
import logo from "../assets/family-feud-logo.png";
import introSound from "../assets/sounds/over.mp3";
import {useState} from "react";
import { playSound } from '../utils/audio';

function Intro() {
        const navigate = useNavigate();
        const [show, setShow] = useState(true);
        const handlePlayGame = () => {
            playSound(introSound);
            setShow(false)
            setTimeout(() => navigate('/play'), 12000);
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

                {show &&
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0 pb-12">
                    <button
                        type="button"
                        onClick={handlePlayGame}
                        className="block text-center text-3xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        START GAME
                    </button>
                    <Link
                        to="/setup-game"
                        className="block text-center text-3xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        SETTINGS
                    </Link>
                    <Link
                        to="/instructions"
                        className="block text-center text-2xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        INSTRUCTIONS
                    </Link>
                </div>
                }
            </div>
        );
}

export default Intro;