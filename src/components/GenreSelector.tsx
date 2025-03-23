"use client";
import { getGenres } from "@/services";
import { Genre } from "@/types/genre";
import { useEffect, useState } from "react";

interface GenreSelectorProps {
  onGenreSelect: (genreId: number | null) => void;
  selectedGenreId: number | null;
}

const GenreSelector = ({
  onGenreSelect,
  selectedGenreId,
}: GenreSelectorProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { genres } = await getGenres();
        setGenres(genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return <div>Loading genres...</div>;
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="genre-select"
      >
        Filter by Genre
      </label>
      <div >
        <select
          id="genre-select"
          value={selectedGenreId || ""}
          onChange={(e) =>
            onGenreSelect(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GenreSelector;
