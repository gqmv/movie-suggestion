"use client";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get recommendations from sessionStorage
    const recommendationsData = sessionStorage.getItem("recommendations");
    if (!recommendationsData) {
      router.push("/");
      return;
    }

    setRecommendations(JSON.parse(recommendationsData));
    setLoading(false);
  }, [router]);

  const handleRestart = () => {
    // Clear session storage and restart process
    sessionStorage.clear();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl mb-8">Loading recommendations...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Recommended Movies for Your Group
      </h1>

      {recommendations.length === 0 ? (
        <p className="text-center text-xl">
          No recommendations found. Please try again.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((movie) => (
            <div key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <button
          onClick={handleRestart}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
