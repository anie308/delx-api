const express = require('express');
require('dotenv').config();
require('./db');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const cors = require('cors');
const app = express();
const apiSeedUrl = '/api/v1';

app.use(cors({origin: true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(`${apiSeedUrl}/admin`, adminRoutes);
app.use(`${apiSeedUrl}/user`, userRoutes);
app.use(`${apiSeedUrl}/category`, categoryRoutes);
app.use(`${apiSeedUrl}/course`, courseRoutes);


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 