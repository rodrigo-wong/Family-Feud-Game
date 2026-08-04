import  {Component} from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/family-feud-logo.png";

class Intro extends Component {
    render() {
        return (
            <div className="relative flex flex-col items-center justify-between h-screen w-full overflow-hidden p-2">
                {/* Logo section that scales down on smaller screens */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                    <img
                        src={logo}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {/* Buttons container fixed to the lower section without overflow */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0 pb-12">
                    <Link
                        to="/play"
                        className="block text-center text-3xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        START GAME
                    </Link>
                    <Link
                        to="/setup-game"
                        className="block text-center text-3xl font-bold bg-gray-900 border-2 rounded-2xl border-white px-6 py-3 text-white w-60 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        SETTINGS
                    </Link>
                </div>
            </div>
        );
    }
}

export default Intro;