"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import './app.css';

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
    <main>
      <h1>Cine Match</h1>
      
      <form onSubmit={handleSubmit} >
        <div>
          <label>
            Number of Users To Choose
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={numUsers}
            onChange={(e) => setNumUsers(parseInt(e.target.value))}
          />
        </div>
        
        <div>
          <label>
            Movies to Show Each User
          </label>
          <input
            type="number"
            min="5"
            max="20" 
            value={moviesPerUser}
            onChange={(e) => setMoviesPerUser(parseInt(e.target.value))}
          />
        </div>
        
        <div >
          <label>
            Movies Each User Can Select
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={selectionsPerUser}
            onChange={(e) => setSelectionsPerUser(parseInt(e.target.value))}
          />
        </div>
        
        <button
          type="submit"
          className='button'
        >
          Start
        </button>
      </form>
    </main>
  );
}
