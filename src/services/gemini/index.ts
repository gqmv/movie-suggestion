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
 * Gets movie recommendations based on user selections
 * @param userSelections Array of arrays containing each user's selected movies
 * @returns Promise containing array of recommended movies
 */
export const getRecommendations = async (
  userSelections: Movie[][]
): Promise<Movie[]> => {
  try {
    if (!userSelections || userSelections.length === 0) {
      console.error("No user selections provided");
      throw new Error("No user selections provided");
    }

    console.log(
      "Starting recommendation process with selections:",
      userSelections
    );

    // Format user preferences for the AI
    const userPreferences = userSelections.map((userMovies, index) => {
      console.log(userMovies);
      const movies = userMovies.map(
        (movie) => `${movie.title} (${movie.release_date?.split("-")[0] || ""})`
      );
      return `User ${index + 1} likes: ${movies.join(", ")}`;
    });

    // Create a flattened list of all movies selected by users
    const allSelectedMovies = userSelections.flat();

    if (allSelectedMovies.length === 0) {
      console.error("No movies in user selections");
      throw new Error("No movies found in user selections");
    }

    // Structure the prompt for Gemini
    const systemMessage = new SystemMessage(
      `You are a movie recommendation expert. Based on the movie preferences of multiple users, 
      recommend 5 movies that the entire group would enjoy watching together. 
      Focus on finding common themes, genres, or styles across their preferences.
      Return only the exact JSON array of movie objects from the provided selections that you recommend.`
    );

    const humanMessage = new HumanMessage(
      `Here are the movie preferences for each user in a group:\n\n${userPreferences.join(
        "\n"
      )}\n\nBased on these preferences, recommend 5 movies from the following list that would be good for the entire group to watch together:\n\n${JSON.stringify(
        allSelectedMovies
      )}\n\nReply with ONLY a JSON array of the 5 movie objects you recommend.`
    );

    console.log("Sending prompt to Gemini");

    // Get recommendations from Gemini
    const response = await model.invoke([systemMessage, humanMessage]);
    console.log("Received response from Gemini:", response.content.toString());

    let recommendations: Movie[] = [];

    try {
      // Extract JSON from response
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
        console.log("No JSON array found, trying to extract movie titles");
        // If no JSON array found, try to extract movie titles and find them in the selected movies
        const titles = responseText.match(/["']([^"']+)["']/g);
        if (titles) {
          console.log("Found titles:", titles);
          const titleSet = new Set(
            titles.map((t) => t.replace(/["']/g, "").toLowerCase())
          );
          recommendations = allSelectedMovies
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
        new Map(allSelectedMovies.map((movie) => [movie.id, movie])).values()
      );
      recommendations = uniqueMovies.slice(0, 5);
      console.log("Fallback recommendations:", recommendations);
    }

    // Make sure we have at least some recommendations
    if (recommendations.length === 0) {
      console.log(
        "No recommendations found, using first 5 movies from selections"
      );
      const uniqueMovies = Array.from(
        new Map(allSelectedMovies.map((movie) => [movie.id, movie])).values()
      );
      recommendations = uniqueMovies.slice(0, 5);
    }

    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations from Gemini:", error);
    throw error;
  }
};
