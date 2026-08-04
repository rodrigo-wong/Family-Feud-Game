import { Routes, Route } from "react-router-dom";
import Intro from "./components/Intro.jsx";
import SetupGame from "./components/SetupGame.jsx";
import DotGridBackground from "./components/DotGridBackground.jsx";

function App() {

  return (
    <>
      <DotGridBackground />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/setup-game" element={<SetupGame />} />
      </Routes>
    </>
  )
}

export default App
