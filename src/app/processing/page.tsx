"use client";
import { getRecommendations } from "@/services/gemini";
import { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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

        // Get recommendations from Gemini with valid selections only
        const recommendations = await getRecommendations(validUserSelections);
        console.log("Received recommendations:", recommendations);

        if (!recommendations || recommendations.length === 0) {
          console.warn("No recommendations returned");
          // Create some fallback recommendations from the user selections
          const allMovies = config.userSelections.flat();
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
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
          Something went wrong
        </h1>
        <p className="mb-8 text-center">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Processing Recommendations
      </h1>
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-8 text-gray-600">
        Using AI to find the perfect movies for your group...
      </p>
    </div>
  );
}
