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

export const getMoviesByGenre = async (genreId: number, page = 1): Promise<MovieResponse> => {
  try {
    const response = await client.get<MovieResponse>('/discover/movie', {
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