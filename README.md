====Step by Step guide to SDI full stack for dummies like me====

This is a guide to set up a very simple, very basic full stack application that can be expanded on further when needed.  
This is to get reps in the silly little steps required to just build a project.

Legend:
# ``` <- is the start of a file (boilerplate stuff)
# === <- this segregates all new steps
# $ <- this signifies a terminal command

Contents (use CTRL-f to find the number with the underscore):

# _01 - Project setup (folders, structure, etc)
# _02 - Database Setup
# _03 - Knex setup
# _04 - Back end api setup
# _05 - Front end setup
# _06 - Docker compose and finish

====_01 Project Setup====

File structure will eventually look like:

```
|--/Root
|  |--/Client
|  |  |--/vite-project
|  |  |  |--/src
|  |--/Server
|  |  |--/db
|  |  |  |--/migrations
|  |  |  |--/seeds
|  |  |  |--knexfile.js
|  |  |--index.js
|  |--.env
|  |--.gitignore
|  |--docker-compose.yaml
```

This is insanely basic. Modify it with routes and controllers and all that at your own leisure

Commands:

$mkdir client server  
$cd server  
$npm init -y  
$npm install bcrypt cors dotenv express knex nodemon pg postgres ps  
$touch index.js  

change package.json to contain "start": "nodemon index.js"

$mkdir db  


$cd ../client   
$npm create vite@latest  (leave the default name if you are following this tutorial word for word)   
$cd vite-project   
$npm install   


$cd ../..   
$touch docker-compose.yaml   


docker-compose.yaml contents:
```

services:
  db:
    image: postgres:latest
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"] #This tests for the health of the db, to ensure db runs before everything else
      interval: 5s
      timeout: 5s
      retries: 5
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: docker
      POSTGRES_DB: your_db #name this whatever you want your db to be
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/

  server:
    build: ./server
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy #Waits for healthu DB
    env_file:
      - .env
    volumes:
      - ./server:/app
    command: sh -c "npx knex migrate:latest --knexfile ./db/knexfile.js && npx knex seed:run --knexfile ./db/knexfile.js && npm start" #Forces migrations and seeds on start"
  
  client:
    build: ./client/vite-project
    ports:
      - "3000:3000"
    depends_on:
      - server
    volumes:
      - ./client/vite-project:/app

volumes:
  db_data:

```

$touch .env   

.env contents:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=docker
POSTGRES_DB=your_db
PORT=8080
#Use openssl rand -base64 64 to generate a code for each of these
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
JWT_SECRET=
```

Setup complete

===== _02 DATABASE ====

$cd server/db

Be sure to change your-db-name to something real

$docker run --name your-db-name \   
-e POSTGRES_PASSWORD=docker \   
-d \   
-p 5432:5432 \   
-v $HOME/docker/volumes/postgres:/var/lib/postgresql \   
postgres   

$docker exec -it your-db-name psql -U postgres   

You should see postgres=#

$CREATE DATABASE yourdb;

$\c yourdb

You should see yourdb=#

==== _03 KNEX ====

$npx knex init

change knexfile.js development to:
```
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost', //edit to db when docker composing, localhost when devving
      user: 'postgres',
      password: 'docker',
      port: 5432,
      database: 'yourdb' //Replace this with the name of the db you CREATE DATABASE'd
    }
  },
```

$npx knex migrate:make create_yourinfo (can be anything create_cats create_favorites etc)    
$npx knex seed:make 01_your_data (make sure it matches the migrate like 01_favorites_data)

Modify your new migration. Example follows:

```
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('favorites', table => {
    table.increments()
    table.string('movie')
    table.string('synopsis')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('favorites')
};
```

Modify your new seed. Example follows:

```
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('favorites').del()
  await knex('favorites').insert([
    {id: 1, movie: 'Sherlock Holmes', synopsis: 'Cool detective tracks down bad guys with really sick fights and irish songs'},
    {id: 2, movie: 'Sherlock Holmes 2', synopsis: 'Cool detective tracks down one really bad guy with cool fights and Roma songs'},
    {id: 3, movie: 'Skinamarink', synopsis: 'One of the eeriest movies I have ever seen. Otherworldly entity traps children in another dimension'}
  ]);
};
```

Test with $npx knex migrate:latest and $npx knex seed:run   
You should see two successes

==== _04 BACKEND API SETUP ====

Edit index.js to contain basic get and listen. Example follows:

```
const express = require('express');
const cors = require('cors');
const knex = require('knex')(require('./db/knexfile').development);

const app = express();
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Movies route
app.get('/movies', async (req, res) => {
  const movies = await knex('favorites');
  res.json(movies);
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

$cd .. (this should take you to the /server folder)   
$npm start   

Enter browser. Test http://localhost:8000 and http://localhost:8000/movies   
If db is running and server is running, you should see your listen message and your movie list.   


==== _05 FRONT END SETUP ====

$cd ../client/vite-project

delete everything in the /public folder, open App.jsx (in /src)   
Replace with boilerplate example:   


```
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
```

$npm run dev

You should see a screen with a loading...   
If your DB and server are still running in or out of docker, shut them down.   

Edit package.json scripts to contain:
```
    "start": "vite --host 0.0.0.0 --port 3000"
```



==== _06 DOCKER COMPOSE AND FINISH ====
inside vite-project:   
$touch Dockerfile    

Client Dockerfile boierplate:

```
FROM node:latest
WORKDIR /app
COPY . /app/
EXPOSE 3000
RUN npm install
CMD ["npm", "start"]
```

cd ../../server   
$touch Dockerfile   

Server Dockerfile boilerplate:

```
FROM node:latest
WORKDIR /app
COPY . /app/
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]
```

# LAST STEPS TO DOUBLE CHECK   
# Before composing, return to your knexfile.js and change host: "localhost" to host: 'db',   
# Make sure everywhere you saw "yourdb" or "your-db-name" or anything like that, you change to the actual name of the db. like "movies"   

$cd ..
$docker compose up

Go to http://localhost:3000

You should see everything up and running   
Continue from here as you wish.   

If you run this multiple times with the exact same info, be sure to   
docker compose down-v   
npx knex migrate:rollback   
enter your database and DELETE FROM knex_migrations WHERE name IN(whatever you named your migration folder), because this will cause issues next migrate   
