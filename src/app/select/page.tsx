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
    console.log(
      "LOADING - Retrieved configData from sessionStorage:",
      parsedConfig
    );

    if (
      !parsedConfig.userSelections ||
      !Array.isArray(parsedConfig.userSelections)
    ) {
      parsedConfig.userSelections = new Array(parsedConfig.numUsers).fill(null);
      console.log(
        "LOADING - Initialized empty userSelections:",
        parsedConfig.userSelections
      );
    }

    // Check if any selections have already been made for the current user
    const existingSelections =
      parsedConfig.userSelections[parsedConfig.currentUserIndex];
    console.log(
      "LOADING - Existing selections for current user:",
      existingSelections
    );

    setConfig(parsedConfig);
    setCurrentUser(parsedConfig.currentUserIndex);
    console.log(
      "LOADING - Current user set to:",
      parsedConfig.currentUserIndex
    );

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await getRandomMovies(parsedConfig.moviesPerUser);
        console.log("LOADING - Fetched movies:", response.results);
        setMovies(response.results);

        // After loading movies, set the selected movies if there are existing selections
        if (
          existingSelections &&
          Array.isArray(existingSelections) &&
          existingSelections.length > 0
        ) {
          // If selections exist, set them in state
          const existingIds = existingSelections.map((movie) => movie.id);
          console.log("LOADING - Setting existing selection IDs:", existingIds);
          setSelectedMovies(existingIds);
        }
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

    console.log(
      "BEFORE STORING - Current selectedMovies (IDs):",
      selectedMovies
    );
    console.log("BEFORE STORING - Current movies state:", movies);

    // Get the CURRENT userSelections directly from sessionStorage to ensure we have the latest
    const configData = sessionStorage.getItem("configData");
    const currentConfigData = configData ? JSON.parse(configData) : config;

    // Create a copy of the userSelections array - using the most up-to-date version
    const userSelections =
      currentConfigData.userSelections &&
      Array.isArray(currentConfigData.userSelections)
        ? [...currentConfigData.userSelections]
        : new Array(config.numUsers).fill(null);

    console.log(
      "BEFORE STORING - Previous userSelections from sessionStorage:",
      JSON.stringify(userSelections)
    );

    // Make sure we're working with an array of the right size
    if (userSelections.length < config.numUsers) {
      // Initialize with null values for all users
      userSelections.length = config.numUsers;
    }

    // Ensure all elements are initialized
    for (let i = 0; i < userSelections.length; i++) {
      if (!userSelections[i]) userSelections[i] = null;
    }

    // Store the selected movies as actual movie objects (not just IDs)
    const selectedMovieObjects = movies.filter((movie) =>
      selectedMovies.includes(movie.id)
    );

    // Store this user's selections at their index
    userSelections[currentUser] = selectedMovieObjects;

    console.log(
      "STORING - Selected movie objects for current user:",
      JSON.stringify(selectedMovieObjects)
    );
    console.log(
      "AFTER STORING - Updated userSelections:",
      JSON.stringify(userSelections)
    );

    // Update the config in sessionStorage
    const updatedConfig = {
      ...currentConfigData,
      userSelections: userSelections,
      currentUserIndex: currentUser + 1,
    };

    // Log to verify what we're storing
    console.log("User " + (currentUser + 1) + " completed selections.");
    console.log(
      "Current user index:",
      currentUser,
      "Next user index:",
      currentUser + 1
    );

    // Store the updated config to sessionStorage
    sessionStorage.setItem("configData", JSON.stringify(updatedConfig));
    console.log(
      "STORED IN SESSION - configData:",
      JSON.stringify(updatedConfig)
    );

    // If all users have made selections, go to results page
    if (currentUser + 1 >= config.numUsers) {
      console.log(
        "All users have completed selections. Final userSelections:",
        JSON.stringify(userSelections)
      );
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
          console.log("New movies fetched for next user:", response.results);
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
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>
        User {currentUser + 1} Preferences
      </h1>
      <p>
        Select {config.selectionsPerUser} movies you enjoy (
        {selectedMovies.length}/{config.selectionsPerUser})
      </p>

      <div>
      {movies.map((movie) => (
        <div
            key={movie.id}
            onClick={() => toggleMovieSelection(movie.id)}>
            <MovieCard movie={movie} isSelected={selectedMovies.includes(movie.id)} />
        </div>
      ))}
  </div>

      <div>
        <button
          onClick={handleNext}
          disabled={selectedMovies.length !== config.selectionsPerUser}
          className='button'
        >
          {currentUser + 1 >= config.numUsers
            ? "Get Recommendations"
            : "Next User"}
        </button>
      </div>
    </div>
  );
}
