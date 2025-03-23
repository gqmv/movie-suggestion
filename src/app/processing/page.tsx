"use client";
import { getRecommendations } from "@/services/gemini";
import { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Analyzing user preferences...");

  useEffect(() => {
    const processSelections = async () => {
      // Get user selections from sessionStorage
      const configData = sessionStorage.getItem("configData");
      if (!configData) {
        router.push("/");
        return;
      }

      const config = JSON.parse(configData);
      console.log("Processing with config:", config);

      if (!config.userSelections || config.userSelections.length === 0) {
        console.error("No user selections found");
        setError("No movie selections found. Please start over.");
        return;
      }

      try {
        console.log("Sending selections to Gemini:", config.userSelections);
        setStatus("Gathering additional movie options...");

        // Filter out any null values from user selections
        const validUserSelections = config.userSelections.filter(
          (selection: any) =>
            selection !== null &&
            Array.isArray(selection) &&
            selection.length > 0
        );

        if (validUserSelections.length === 0) {
          setError("No valid movie selections found. Please start over.");
          return;
        }

        setStatus("Analyzing preferences and finding perfect matches...");

        // Get recommendations from Gemini with valid selections only
        const recommendations = await getRecommendations(validUserSelections);
        console.log("Received recommendations:", recommendations);

        setStatus("Processing recommendations...");

        if (!recommendations || recommendations.length === 0) {
          console.warn("No recommendations returned");
          // Create some fallback recommendations from the user selections
          const allMovies = config.userSelections.flat().filter(Boolean);
          const uniqueMovies = Array.from(
            new Map(allMovies.map((movie: Movie) => [movie.id, movie])).values()
          );
          const fallbackRecommendations = uniqueMovies.slice(0, 5);

          sessionStorage.setItem(
            "recommendations",
            JSON.stringify(fallbackRecommendations)
          );
        } else {
          // Store recommendations in sessionStorage
          sessionStorage.setItem(
            "recommendations",
            JSON.stringify(recommendations)
          );
        }

        // Navigate to results page
        router.push("/results");
      } catch (error) {
        console.error("Error getting recommendations:", error);
        setError(
          `Error: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`
        );
      }
    };

    processSelections();
  }, [router]);

  if (error) {
    return (
      <div>
        <h1>Something went wrong</h1>
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="button">
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Processing Recommendations</h1>
      <div></div>
      <p>{status}</p>
    </div>
  );
}
