import { Routes, Route, useLocation } from "react-router-dom";
import Intro from "./components/Intro.jsx";
import SelectGame from "./components/SelectGame.jsx";
import SetupGame from "./components/SetupGame.jsx";
import Answers from "./components/Answers.jsx";
import Play from "./components/Play.jsx";
import Instructions from "./components/Instructions.jsx";
import DotGridBackground from "./components/DotGridBackground.jsx";
import HostPlay from "./components/HostPlay.jsx";
import WaitingRoom from "./components/WaitingRoom.jsx";
import { ServerStatusProvider } from "./utils/ServerStatusContext.jsx";

function App() {
  const location = useLocation();

  return (
    <ServerStatusProvider>
      <DotGridBackground />
      <Routes>
        <Route path="/" element={<Intro key={location.key} />} />
        <Route path="/select-game" element={<SelectGame />} />
        <Route path="/setup-game" element={<SetupGame />} />
        <Route path="/answers" element={<Answers />} />
        <Route path="/play" element={<Play />} />
        <Route path="/host" element={<HostPlay />} />
        <Route path="/instructions" element={<Instructions />} />
          <Route path="/waiting-room" element={<WaitingRoom />} />
      </Routes>
    </ServerStatusProvider>
  )
}

export default App
