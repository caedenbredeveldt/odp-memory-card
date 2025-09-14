import "./GameCard.css";

export default function GameCard({ name, imageUrl, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <img src={imageUrl} alt={name} />
      <h3 className="card-title">{name}</h3>
    </div>
  );
}
