import { useState, useEffect } from "react";
import "./App.css";
import ScoreCard from "./components/score-card/ScoreCard";
import GameCard from "./components/game-card/GameCard";

const ACCESS_TOKEN = "784ff5664816f992eed309b7c55152a5";

const CHARACTER_IDS = [106, 346, 149, 622, 332, 659, 107, 251, 303, 234];

async function fetchHero(id) {
  const resp = await fetch(`/superhero/${ACCESS_TOKEN}/${id}`, {
    headers: { accept: "application/json" },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Upstream ${resp.status}: ${text || resp.statusText}`);
  }
  const data = await resp.json();
  if (data.response !== "success") throw new Error(data.error || "API error");
  return {
    id: Number(data.id),
    name: data.name,
    imageUrl: data.image?.url,
    clicked: false,
  };
}

function shuffle(arr) {
  // Fisher–Yates
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const results = await Promise.all(CHARACTER_IDS.map(fetchHero));
        if (!cancelled) setCards(shuffle(results));
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load heroes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCardClick = (id) => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;

      const clickedCard = prev[idx];

      // Clicked a duplicate: reset score and clicked flags, reshuffle
      if (clickedCard.clicked) {
        setScore(0);
        const reset = prev.map((c) => ({ ...c, clicked: false }));
        return shuffle(reset);
      }

      // New unique click
      const newScore = score + 1;
      setScore(newScore);
      setHighScore((hs) => Math.max(hs, newScore));

      const updated = prev.map((c) =>
        c.id === id ? { ...c, clicked: true } : c
      );

      // Reshuffle after each successful click to make it a memory game
      return shuffle(updated);
    });
  };

  return (
    <>
      <div className="header">
        <div className="intro">
          <h1>Marvel Memory Card Game</h1>
          <h2>
            Click on a card to earn points, but don't click on any more than
            once!
          </h2>
        </div>
        <ScoreCard score={score} highScore={highScore} />
      </div>
      <div className="cards-container">
        {loading &&
          CHARACTER_IDS.map((id) => (
            <div key={id} className="card loading">
              Loading…
            </div>
          ))}

        {!loading && error && (
          <div className="card error">Failed to load: {error}</div>
        )}

        {!loading &&
          !error &&
          cards.map((c) => (
            <GameCard
              key={c.id}
              name={c.name}
              imageUrl={c.imageUrl}
              onClick={() => handleCardClick(c.id)}
            />
          ))}
      </div>
    </>
  );
}

export default App;
