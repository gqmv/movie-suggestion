import { Movie } from "@/types/movie";
import "./MovieList.css";

interface MovieCardProps {
  movie: Movie;
  isSelected: boolean;
}

const MovieCard = ({ movie, isSelected  }: MovieCardProps) => {
  return (
    <div className="movie-card" style={{
      backgroundColor: isSelected ? 'lightgreen' : '#fff', // Condicional para o fundo
    }}>
      <div>
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-info">
          <span>{movie.release_date?.split("-")[0] || "Unknown"}</span>
          <span className="movie-rating">
            ⭐ {movie.vote_average.toFixed(1)}
          </span>
        </div>
        <p className="movie-overview">{movie.overview}</p>
      </div>
      <div className="movie-gradient-bar" />
    </div>
  );
};

export default MovieCard;
