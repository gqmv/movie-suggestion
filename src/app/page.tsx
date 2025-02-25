"use client";
import GenreSelector from "@/components/GenreSelector";
import MovieList from "@/components/MovieList";
import { getMoviesByGenre, getPopularMovies } from "@/services";
import { Movie } from "@/types/movie";
import { useEffect, useState } from "react";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedGenreId) {
          response = await getMoviesByGenre(selectedGenreId);
        } else {
          response = await getPopularMovies();
        }
        setMovies(response.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenreId]);

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenreId(genreId);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Movie Database</h1>
      <GenreSelector
        onGenreSelect={handleGenreSelect}
        selectedGenreId={selectedGenreId}
      />
      <MovieList movies={movies} isLoading={loading} />
    </main>
  );
}
