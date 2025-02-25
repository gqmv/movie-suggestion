import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_TMDB_API_URL;

const client = axios.create({
  baseURL,
  params: {
    api_key: apiKey,
  },
});

export default client; 