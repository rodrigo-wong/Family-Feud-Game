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
        <Section title="1. Pick a game">
          <p>
            From the home screen, click <span className="font-bold">SELECT GAME</span>.
            You&apos;ll see your custom game (if you&apos;ve saved one) at the top and a
            library of default games below. Each game shows a{' '}
            <span className="font-bold">Play</span> and a{' '}
            <span className="font-bold">View</span> button.
          </p>
        </Section>

        <Section title="2. (Optional) Build your own game">
          <p>
            Click <span className="font-bold">CUSTOM</span> from the home screen to write
            your own questions, answers, and point values. Use the{' '}
            <span className="font-bold">‹‹</span> / <span className="font-bold">››</span>{' '}
            arrows (or the dots) to move between questions, and{' '}
            <span className="font-bold">+ Add answer</span> /{' '}
            <span className="font-bold">+ Add question</span> to add more &mdash; the{' '}
            <span className="font-bold">✕</span> buttons remove them again.
          </p>
          <p>
            Click <span className="font-bold">Save</span> to store it &mdash; it&apos;ll
            then appear in the &quot;Your Custom Game&quot; section on the Select Game
            screen and become the active game. <span className="font-bold">Clear Game</span>{' '}
            removes it entirely.
          </p>
        </Section>

        <Section title="3. Review answers before playing">
          <p>
            Click <span className="font-bold">View</span> on any game to open its Review
            Answers page. Answers start hidden; click{' '}
            <span className="font-bold">Reveal Answers</span> to show them all, or{' '}
            <span className="font-bold">Hide Answers</span> to hide them again. This is
            just a preview and doesn&apos;t affect a game in progress.
          </p>
        </Section>

        <Section title="4. Start the game &mdash; connect two screens">
          <p>
            Click <span className="font-bold">Play</span> on the game you want on the
            device you&apos;ll use as the <span className="font-bold">display</span>{' '}
            (the TV or projector everyone watches). It shows a QR code &mdash; scan it
            with the phone or tablet you want to use as the{' '}
            <span className="font-bold">host controller</span>. As soon as that device
            connects, the display automatically switches from the QR code to the game
            board.
          </p>
        </Section>

        <Section title="5. Enter team names">
          <p>
            On the host controller, type in each team&apos;s name and click{' '}
            <span className="font-bold">CONTINUE</span> &mdash; there&apos;s no timer, so
            take your time. Names sync live to the display as you type.
          </p>
        </Section>

        <Section title="6. Reveal the logo, question &amp; board">
          <p>
            The board starts covered by the Family Feud logo. Click{' '}
            <span className="font-bold">Next →</span> to reveal the question to the
            players, then click it again to reveal the board.
          </p>
        </Section>

        <Section title="7. Reveal answers">
          <p>
            When a team gives a correct answer, click that answer&apos;s tile on the
            board to flip it over and reveal it. This plays a &quot;yes&quot; sound
            effect and adds its points to the point bank above the board.
          </p>
        </Section>

        <Section title="8. Strikes">
          <p>
            When a team gives a wrong answer, click the{' '}
            <span className="font-bold">X</span>, <span className="font-bold">XX</span>,
            or <span className="font-bold">XXX</span> button to show that many strikes
            full-screen. This plays a &quot;no&quot; sound effect and the strikes
            automatically clear after a couple seconds.
          </p>
        </Section>

        <Section title="9. Soundboard">
          <p>
            Use the 🔥 and 🥁 buttons any time to play optional &quot;intense&quot; and
            &quot;drum roll&quot; sound effects to build suspense.
          </p>
        </Section>

        <Section title="10. Award points">
          <p>
            Once a team has control of the board, click{' '}
            <span className="font-bold">Next →</span> to move to the award screen, then
            click the winning team&apos;s name to give them the points in the bank.{' '}
            <span className="font-bold">Next →</span> is disabled here &mdash; picking a
            team is what advances the game.
          </p>
        </Section>

        <Section title="11. Reveal remaining answers">
          <p>
            If any answers are still hidden after points are awarded, the game moves to
            a reveal step. Click <span className="font-bold">Next →</span> to flip over
            the remaining answers one at a time; once they&apos;re all shown, the same
            button moves on to the next question.
          </p>
        </Section>

        <Section title="12. Undo &amp; navigate back">
          <p>
            Click <span className="font-bold">← Previous</span> at almost any point
            (other than while entering team names) to step back &mdash; undo an awarded
            point, return to the board, or hide the question again.
          </p>
        </Section>

        <Section title="13. Game over">
          <p>
            After the last question, the winner is announced based on final scores.
            Click <span className="font-bold">← Previous</span> to undo the last award if
            needed.
          </p>
        </Section>

        <Section title="Not sure what Next → will do?">
          <p>
            The line above the board (for example &quot;Question 2 of 5 • Next: Reveal
            answer #3&quot;) always tells you exactly what clicking{' '}
            <span className="font-bold">Next →</span> will do from wherever you are.
          </p>
        </Section>

        <Section title="Getting around">
          <p>
            Most screens have a button in the top-left corner to take you back. On
            Select Game, Custom Game, and Instructions it reads{' '}
            <span className="font-bold">← Home</span> and returns to the main screen. On
            the Review Answers page it reads{' '}
            <span className="font-bold">← Back</span> and returns you to the Select Game
            screen (or Home, if you opened it another way). The host controller and the
            QR waiting screen don&apos;t have a back button &mdash; close or refresh the
            tab to leave them.
          </p>
        </Section>
      </div>
    </div>
  );
}

export default Instructions;
