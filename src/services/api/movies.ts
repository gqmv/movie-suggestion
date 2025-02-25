import { MovieResponse } from '@/types/movie';
import client from './client';

export const getPopularMovies = async (page = 1): Promise<MovieResponse> => {
  try {
    const response = await client.get<MovieResponse>('/movie/popular', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getMoviesByGenre = async (
  genreId: number,
  page = 1
): Promise<MovieResponse> => {
  try {
    const response = await client.get<MovieResponse>("/discover/movie", {
      params: {
        with_genres: genreId,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error);
    throw error;
  }
};

export const getRandomMovies = async (
  count: number = 10
): Promise<MovieResponse> => {
  try {
    // Get a random page between 1 and 10 to get different movies each time
    const randomPage = Math.floor(Math.random() * 10) + 1;

    const response = await client.get<MovieResponse>("/movie/popular", {
      params: {
        page: randomPage,
        // Add some randomness with sort options
        sort_by: Math.random() > 0.5 ? "popularity.desc" : "vote_count.desc",
      },
    });

    // Shuffle the results for additional randomness
    const shuffledResults = [...response.data.results].sort(
      () => Math.random() - 0.5
    );

    // Return only the requested count
    return {
      ...response.data,
      results: shuffledResults.slice(0, count),
    };
  } catch (error) {
    console.error("Error fetching random movies:", error);
    throw error;
  }
}; 