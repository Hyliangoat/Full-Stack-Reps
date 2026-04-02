import { useState, useEffect } from 'react';

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchMovie() {
      let response = await fetch('http://localhost:8000/movies')
      let moviesList = await response.json()
      setMovies(moviesList)
      console.log(moviesList[0])
    }
    fetchMovie();
  }, []);


  if (movies.length < 1){
    return(
      <p>loading...</p>
    )
  }

  return (
    <div>
      <h1>My Favorite Movies</h1>
      {movies.map(movie => (
        <div key={movie.id}>
          <h2>{movie.movie}</h2>
          <p>{movie.synopsis}</p>
        </div>
      ))}
    </div>
  );
}

export default App;