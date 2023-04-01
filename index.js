const express = require('express');
require('dotenv').config();
require('./db');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const apiSeedUrl = '/api/v1';


app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(`${apiSeedUrl}/user`, userRoutes);
app.use(`${apiSeedUrl}/category`, categoryRoutes);


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 