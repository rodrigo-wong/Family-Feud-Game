import { Routes, Route } from "react-router-dom";
import Intro from "./components/Intro.jsx";
import SetupGame from "./components/SetupGame.jsx";
import Answers from "./components/Answers.jsx";
import DotGridBackground from "./components/DotGridBackground.jsx";

function App() {

  return (
    <>
      <DotGridBackground />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/setup-game" element={<SetupGame />} />
        <Route path="/answers" element={<Answers />} />
      </Routes>
    </>
  )
}

export default App
