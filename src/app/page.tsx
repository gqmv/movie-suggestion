"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [numUsers, setNumUsers] = useState(1);
  const [moviesPerUser, setMoviesPerUser] = useState(10);
  const [selectionsPerUser, setSelectionsPerUser] = useState(3);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store configuration in sessionStorage
    sessionStorage.setItem("configData", JSON.stringify({
      numUsers, 
      moviesPerUser,
      selectionsPerUser,
      currentUserIndex: 0,
      userSelections: []
    }));
    
    router.push("/select");
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Movie Recommendation System</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Users
          </label>
          <input
            type="number"
            min="1"
            max="5"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={numUsers}
            onChange={(e) => setNumUsers(parseInt(e.target.value))}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Movies to Show Each User
          </label>
          <input
            type="number"
            min="5"
            max="20"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={moviesPerUser}
            onChange={(e) => setMoviesPerUser(parseInt(e.target.value))}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Movies Each User Can Select
          </label>
          <input
            type="number"
            min="1"
            max="10"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectionsPerUser}
            onChange={(e) => setSelectionsPerUser(parseInt(e.target.value))}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Start
        </button>
      </form>
    </main>
  );
}
