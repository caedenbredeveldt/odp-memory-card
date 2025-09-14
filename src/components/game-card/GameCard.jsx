import "./GameCard.css";

// const ACCESS_TOKEN = "784ff5664816f992eed309b7c55152a5";

export default function GameCard({ name, imageUrl, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <img src={imageUrl} alt={name} />
      <h3 className="card-title">{name}</h3>
    </div>
  );
}
