import { Movie } from "@/types/movie";
import "./MovieList.css";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
}

const MovieCard = ({ movie, isSelected }: MovieCardProps) => {
  // Build the image URL using the poster_path, or fallback to a default image if missing.
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : "/default-movie.png";

  return (
    <div className="movie-card" style={{ backgroundColor: isSelected ? "lightgreen" : "#fff" }}>
      <img src={imageUrl} alt={movie.title} className="movie-image" />
      <div>
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-info">
          <span>{movie.release_date?.split("-")[0] || "Unknown"}</span>
          <span className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</span>
        </div>
        <p className="movie-overview">{movie.overview}</p>
      </div>
      <div className="movie-gradient-bar" />
    </div>
  );
};

export default MovieCard;
