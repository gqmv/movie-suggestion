import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";
import "./MovieList.css";

interface MovieListProps {
  movies: Movie[];
  isLoading: boolean;
}

const MovieList = ({ movies, isLoading }: MovieListProps) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading movies...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="empty-container">
        <p className="empty-text">No movies found</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;
