import { Link } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border-2 border-white rounded-2xl p-4">
      <p className="font-bold text-xl mb-2">{title}</p>
      <div className="flex flex-col gap-1 text-white/90">{children}</div>
    </div>
  );
}

function Instructions() {
  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-12 gap-8 text-white">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 border-2 border-white px-4 py-2 text-lg font-bold text-white hover:bg-gray-800 transition-colors cursor-pointer"
      >
        ← Home
      </Link>

      <h1 className="text-4xl font-bold">How to Play</h1>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        <Section title="1. Set up your questions">
          <p>
            Go to <span className="font-bold">Settings</span> and add your questions,
            answers, and point values before you start. Your game is saved automatically
            so you can come back to it later.
          </p>
        </Section>

        <Section title="2. Start the game">
          <p>
            From the home screen, click <span className="font-bold">START GAME</span>.
            The intro sound plays and, after a 7 second countdown, the game board
            appears.
          </p>
        </Section>

        <Section title="3. Reveal the logo &amp; question">
          <p>
            The board starts covered by the Family Feud logo. Use the{' '}
            <span className="font-bold">Show Question</span> button (or press the{' '}
            <span className="font-bold">→</span> arrow key) to reveal the current
            question to the players.
          </p>
        </Section>

        <Section title="4. Reveal answers">
          <p>
            When a team gives a correct answer, click that answer&apos;s tile on the
            board to flip it over and reveal it. This plays a &quot;yes&quot; sound
            effect and adds its points to the point bank above the board.
          </p>
        </Section>

        <Section title="5. Strikes">
          <p>
            When a team gives a wrong answer, click the{' '}
            <span className="font-bold">X</span>, <span className="font-bold">XX</span>,
            or <span className="font-bold">XXX</span> button to show that many strikes
            full-screen. This plays a &quot;no&quot; sound effect and the strikes
            automatically clear after a few seconds. Click the same strike button again
            to dismiss it early.
          </p>
        </Section>

        <Section title="6. Soundboard">
          <p>
            Use the 🔥 and 🥁 buttons any time to play optional &quot;intense&quot; and
            &quot;drum roll&quot; sound effects to build suspense.
          </p>
        </Section>

        <Section title="7. Award points">
          <p>
            Once a team has control of the board, press{' '}
            <span className="font-bold">→</span> to move to the award screen and click{' '}
            <span className="font-bold">Team 1</span> or{' '}
            <span className="font-bold">Team 2</span> to give them the points in the
            bank.
          </p>
        </Section>

        <Section title="8. Reveal remaining answers">
          <p>
            If any answers are still hidden after points are awarded, the game moves to
            a reveal step. Press <span className="font-bold">→</span> to flip over the
            remaining answers one at a time until the board is complete, then it
            automatically advances to the next question.
          </p>
        </Section>

        <Section title="9. Undo &amp; navigate back">
          <p>
            Press <span className="font-bold">←</span> at almost any point to step back
            &mdash; undo an awarded point, return to the board, or hide the question
            again.
          </p>
        </Section>

        <Section title="10. Game over">
          <p>
            After the last question, the winner is announced based on final scores.
            Press <span className="font-bold">←</span> to undo the last award if needed.
          </p>
        </Section>

        <Section title="Quick keyboard reference">
          <p>
            <span className="font-bold">→</span> &mdash; advance (show question, move to
            award screen, reveal next answer, next question)
          </p>
          <p>
            <span className="font-bold">←</span> &mdash; go back (undo award, hide
            question, return to board)
          </p>
        </Section>

        <Section title="Getting home">
          <p>
            Click the <span className="font-bold">← Home</span> button in the top-left
            corner at any time during the game to return to the main screen.
          </p>
        </Section>
      </div>
    </div>
  );
}

export default Instructions;
