import { GenreResponse } from '@/types/genre';
import client from './client';

export const getGenres = async (): Promise<GenreResponse> => {
  try {
    const response = await client.get<GenreResponse>('/genre/movie/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
}; 