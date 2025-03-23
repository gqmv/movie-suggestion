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
      <div>
        <h1>Loading recommendations...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>
        Recommended Movies for Your Group
      </h1>

      {recommendations.length === 0 ? (
        <p>
          No recommendations found. Please try again.
        </p>
      ) : (
        <div>
          {recommendations.map((movie) => (
            <div key={movie.id}>
              <MovieCard movie={movie} isSelected={false}/>
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          onClick={handleRestart}
          className='button'
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
