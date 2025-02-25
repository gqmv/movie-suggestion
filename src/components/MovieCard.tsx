import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{movie.release_date?.split("-")[0] || "Unknown"}</span>
          <span>⭐ {movie.vote_average.toFixed(1)}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3">{movie.overview}</p>
      </div>
    </div>
  );
};

export default MovieCard;
