import { getMoviesByGenre, getPopularMovies } from "@/services/api/movies";
import { Movie } from "@/types/movie";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Initialize the Gemini model with error handling
let model: ChatGoogleGenerativeAI;
try {
  model = new ChatGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
    modelName: "gemini-2.0-flash",
  });
} catch (error) {
  console.error("Error initializing Gemini model:", error);
  throw new Error("Failed to initialize AI model");
}

/**
 * A single user's mood and selected movies.
 */
interface UserSelection {
  mood: string;       // e.g. "Happy", "Sad", etc.
  movies: Movie[];    // the actual movie objects the user selected
}

/**
 * Gets movie recommendations based on user selections
 * @param userSelections Array of objects, each with a mood and an array of selected movies
 * @returns Promise containing an array of recommended Movie objects
 */
export const getRecommendations = async (
  userSelections: UserSelection[]
): Promise<Movie[]> => {
  try {
    if (!userSelections || userSelections.length === 0) {
      console.error("No user selections provided");
      throw new Error("No user selections provided");
    }

    console.log("Starting recommendation process with selections:", userSelections);

    // 1) Format user preferences for the AI prompt
    const userPreferences = userSelections.map((userSelection, index) => {
      console.log("User selection object:", userSelection);
      const { mood, movies: userMovies } = userSelection;
      const moviesList = userMovies.map(
        (movie) => `${movie.title} (${movie.release_date?.split("-")[0] || ""})`
      );
      return `User ${index + 1} (mood: ${mood}) likes: ${moviesList.join(", ")}`;
    });

    // 2) Create a flattened list of all movies selected by all users
    const allSelectedMovies = userSelections.flatMap((sel) => sel.movies);

    if (allSelectedMovies.length === 0) {
      console.error("No movies in user selections");
      throw new Error("No movies found in user selections");
    }

    // 3) Extract genres from user selections
    const selectedGenres = new Set<number>();
    allSelectedMovies.forEach((movie) => {
      if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
        movie.genre_ids.forEach((genreId) => selectedGenres.add(genreId));
      }
    });

    console.log("Extracted genres from user selections:", Array.from(selectedGenres));

    // 4) Fetch additional movies (popular + by top genres) to give Gemini more options
    let additionalMovies: Movie[] = [];

    try {
      const popularMoviesResponse = await getPopularMovies(1);
      additionalMovies.push(...popularMoviesResponse.results);
      console.log(`Added ${popularMoviesResponse.results.length} popular movies`);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
    }

    // Get movies by genre for top 3 genres (if available)
    const topGenres = Array.from(selectedGenres).slice(0, 3);
    for (const genreId of topGenres) {
      try {
        const genreMoviesResponse = await getMoviesByGenre(genreId, 1);
        additionalMovies.push(...genreMoviesResponse.results);
        console.log(`Added ${genreMoviesResponse.results.length} movies from genre ${genreId}`);
      } catch (error) {
        console.error(`Error fetching movies for genre ${genreId}:`, error);
      }
    }

    // 5) Remove duplicates from additional movies (by ID)
    const uniqueAdditionalMovies = Array.from(
      new Map(additionalMovies.map((m) => [m.id, m])).values()
    );

    // Remove movies that are already in user selections
    const selectedMovieIds = new Set(allSelectedMovies.map((m) => m.id));
    const filteredAdditionalMovies = uniqueAdditionalMovies.filter(
      (movie) => !selectedMovieIds.has(movie.id)
    );

    console.log(`Added ${filteredAdditionalMovies.length} unique additional movies`);

    // Combine user-selected movies with additional movies
    const allAvailableMovies = [...allSelectedMovies, ...filteredAdditionalMovies];

    // 6) Structure the prompt for Gemini
    const systemMessage = new SystemMessage(
      `You are a movie recommendation expert. Based on the movie preferences of multiple users, 
      recommend 5 movies that the entire group would enjoy watching together. 
      Focus on finding common themes, genres, or styles across their preferences.
      I will provide you with two sets of movies:
      1. Movies that users have specifically selected as their preferences
      2. Additional popular and genre-related movies that might match the group's taste
      3. DO NOT use the movies that are already in the user-selected movies, as they are already known preferences, don't recommend them again in any circumstances.
      4. Use the mood as a REALLY IMPORTANT feedback of each user as a guide to find movies that match the group's overall mood, this is a major feedback.

      Consider both sets, but prioritize recommendations that align well with user preferences.
      Return only the exact JSON array of 5 movie objects that you recommend.`
    );

    const humanMessage = new HumanMessage(
      `Here are the movie preferences for each user in a group:\n\n${userPreferences.join(
        "\n"
      )}\n\n
      Based on these preferences, recommend 5 movies that would be good for the entire group to watch together.

      USER-SELECTED MOVIES (prioritize these as they represent confirmed preferences):
      ${JSON.stringify(allSelectedMovies)}

      ADDITIONAL MOVIE OPTIONS (consider these as well for more diverse recommendations):
      ${JSON.stringify(filteredAdditionalMovies.slice(0, 30))}

      Reply with ONLY a JSON array of the 5 movie objects you recommend.`
    );

    console.log("Sending prompt to Gemini");

    // 7) Send prompt to Gemini
    const response = await model.invoke([systemMessage, humanMessage]);
    console.log("Received response from Gemini:", response.content.toString());

    let recommendations: Movie[] = [];

    try {
      // Attempt to parse a JSON array out of the response
      const responseText = response.content.toString();
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      console.log("JSON match:", jsonMatch ? "Found" : "Not found");

      if (jsonMatch) {
        try {
          recommendations = JSON.parse(jsonMatch[0]);
          console.log("Successfully parsed recommendations:", recommendations);
        } catch (parseJsonError) {
          console.error("Error parsing JSON from match:", parseJsonError);
          throw parseJsonError;
        }
      } else {
        // If Gemini didn't return a clean JSON array, try extracting movie titles
        console.log("No JSON array found, trying to extract movie titles");
        const titles = responseText.match(/["']([^"']+)["']/g);
        if (titles) {
          console.log("Found titles:", titles);
          const titleSet = new Set(
            titles.map((t) => t.replace(/["']/g, "").toLowerCase())
          );
          recommendations = allAvailableMovies
            .filter((movie) => titleSet.has(movie.title.toLowerCase()))
            .slice(0, 5);
          console.log("Recommendations from titles:", recommendations);
        }
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      // Fallback: just return the first 5 unique movies from all selections
      console.log("Using fallback recommendation method");
      const uniqueMovies = Array.from(
        new Map(allSelectedMovies.map((m) => [m.id, m])).values()
      );
      recommendations = uniqueMovies.slice(0, 5);
      console.log("Fallback recommendations:", recommendations);
    }

    // 8) Final fallback if we still have no recommendations
    if (recommendations.length === 0) {
      console.log("No recommendations found, using first 5 movies from selections");
      const uniqueMovies = Array.from(
        new Map(allSelectedMovies.map((m) => [m.id, m])).values()
      );
      recommendations = uniqueMovies.slice(0, 5);
    }

    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations from Gemini:", error);
    throw error;
  }
};
