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


    if (
      !parsedConfig.userSelections ||
      !Array.isArray(parsedConfig.userSelections)
    ) {
      parsedConfig.userSelections = new Array(parsedConfig.numUsers).fill(null);
    }

    setConfig(parsedConfig);
    setCurrentUser(parsedConfig.currentUserIndex);

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
