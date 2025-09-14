import "./ScoreCard.css";
export default function ScoreCard({ score, highScore }) {
  return (
    <div className="score-card">
      <h3>Score: {score}</h3>
      <h3>High Score: {highScore}</h3>
    </div>
  );
}
