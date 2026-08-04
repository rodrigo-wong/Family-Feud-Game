import  {Component} from 'react';
import logo from "../assets/family-feud-logo.png";

class Intro extends Component {
    render() {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen">
                <img src={logo} alt="Logo" />

                <div className="top-[calc(75%+120px)] transform -translate-y-1/2">
                    <p className="text-center text-4xl bg-gray-900 border-2 rounded-2xl border-white p-2 text-white w-60 cursor-pointer">
                        START GAME
                    </p>
                </div>
            </div>
        );
    }
}

export default Intro;