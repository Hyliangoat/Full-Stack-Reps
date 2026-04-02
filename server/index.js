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