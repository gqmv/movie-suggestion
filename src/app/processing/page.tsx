"use client";
import { getRecommendations } from "@/services/gemini";
// ^^^ or wherever your updated getRecommendations is
import { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserSelection {
  mood: string;
  movies: Movie[];
}

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Analyzing user preferences...");

  useEffect(() => {
    const processSelections = async () => {
      // 1) Retrieve config from sessionStorage
      const configData = sessionStorage.getItem("configData");
      if (!configData) {
        router.push("/");
        return;
      }
      const config = JSON.parse(configData);
      console.log("Processing with config:", config);

      // 2) Validate userSelections
      if (!config.userSelections || !Array.isArray(config.userSelections)) {
        setError("No movie selections found. Please start over.");
        return;
      }

      // 3) Filter out any null or empty picks
      //    Each element is { mood: string, movies: Movie[] }
      const validUserSelections: UserSelection[] = config.userSelections.filter(
        (selection: any) =>
          selection !== null &&
          Array.isArray(selection.movies) &&
          selection.movies.length > 0
      );

      if (validUserSelections.length === 0) {
        setError("No valid movie selections found. Please start over.");
        return;
      }

      try {
        setStatus("Gathering additional movie options...");

        // 4) Call getRecommendations with the new shape
        console.log("Sending validUserSelections to Gemini:", validUserSelections);
        setStatus("Analyzing preferences and finding perfect matches...");

        const recommendations = await getRecommendations(validUserSelections);
        console.log("Received recommendations:", recommendations);

        setStatus("Processing recommendations...");

        // 5) If no recommendations, handle fallback logic
        if (!recommendations || recommendations.length === 0) {
          console.warn("No recommendations returned");
          // Build a fallback from userSelections if you want
          // or just store an empty array
          sessionStorage.setItem("recommendations", JSON.stringify([]));
        } else {
          // 6) Store the real recommendations in sessionStorage
          sessionStorage.setItem(
            "recommendations",
            JSON.stringify(recommendations)
          );
        }

        // 7) Navigate to the results page
        router.push("/results");
      } catch (err) {
        console.error("Error getting recommendations:", err);
        setError(
          `Error: ${err instanceof Error ? err.message : "Unknown error occurred"
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
      <p>{status}</p>
    </div>
  );
}
