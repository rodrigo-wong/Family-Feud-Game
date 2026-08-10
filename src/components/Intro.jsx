import {Link} from 'react-router-dom';
import logo from "../assets/family-feud-logo.png";
import VolumeControl from "./VolumeControl.jsx";

function Intro() {
    return (
        <div>
            <VolumeControl/>

            <div className="relative flex flex-col items-center justify-between h-screen w-full overflow-hidden p-2">
                <div className="flex-1 flex items-center justify-center min-h-0">
                    <img
                        src={logo}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

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
            </div>
        </div>
    );
}

export default Intro;
