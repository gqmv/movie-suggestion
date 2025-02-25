"use client";
import MovieCard from "@/components/MovieCard";
import { getRandomMovies } from "@/services/api/movies";
import { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SelectPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Retrieve configuration from sessionStorage
    const configData = sessionStorage.getItem("configData");
    if (!configData) {
      router.push("/");
      return;
    }

    const parsedConfig = JSON.parse(configData);

    // Initialize userSelections as an array with the correct length if it doesn't exist
    if (
      !parsedConfig.userSelections ||
      !Array.isArray(parsedConfig.userSelections)
    ) {
      parsedConfig.userSelections = new Array(parsedConfig.numUsers).fill(null);
    }

    setConfig(parsedConfig);
    setCurrentUser(parsedConfig.currentUserIndex);

    // Fetch random movies for the user
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await getRandomMovies(parsedConfig.moviesPerUser);
        setMovies(response.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [router]);

  const toggleMovieSelection = (movieId: number) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter((id) => id !== movieId));
    } else {
      if (selectedMovies.length < config?.selectionsPerUser) {
        setSelectedMovies([...selectedMovies, movieId]);
      }
    }
  };

  const handleNext = () => {
    if (!config) return;

    // Store this user's selections
    const userSelections = [...config.userSelections];
    // Make sure we're working with an array of the right size
    if (
      !Array.isArray(userSelections) ||
      userSelections.length < config.numUsers
    ) {
      userSelections.length = config.numUsers;
    }

    // Store the selected movies as actual movie objects (not just IDs)
    userSelections[currentUser] = movies.filter((movie) =>
      selectedMovies.includes(movie.id)
    );

    // Update the config in sessionStorage
    const updatedConfig = {
      ...config,
      userSelections,
      currentUserIndex: currentUser + 1,
    };

    // Log to verify what we're storing
    console.log("Storing user selections:", userSelections);

    sessionStorage.setItem("configData", JSON.stringify(updatedConfig));

    // If all users have made selections, go to results page
    if (currentUser + 1 >= config.numUsers) {
      router.push("/processing");
    } else {
      // Reset for next user
      setCurrentUser(currentUser + 1);
      setSelectedMovies([]);
      setLoading(true);

      // Fetch new movies for next user
      const fetchMovies = async () => {
        try {
          const response = await getRandomMovies(config.moviesPerUser);
          setMovies(response.results);
        } catch (error) {
          console.error("Error fetching movies:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMovies();
    }
  };

  if (loading || !config) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-center">
        User {currentUser + 1} Preferences
      </h1>
      <p className="text-center mb-8">
        Select {config.selectionsPerUser} movies you enjoy (
        {selectedMovies.length}/{config.selectionsPerUser})
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => toggleMovieSelection(movie.id)}
            className={`cursor-pointer transition-transform transform ${
              selectedMovies.includes(movie.id)
                ? "ring-4 ring-blue-500 scale-105"
                : "hover:scale-102"
            }`}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleNext}
          disabled={selectedMovies.length !== config.selectionsPerUser}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            selectedMovies.length === config.selectionsPerUser
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {currentUser + 1 >= config.numUsers
            ? "Get Recommendations"
            : "Next User"}
        </button>
      </div>
    </div>
  );
}
