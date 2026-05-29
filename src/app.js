const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const errorHandler = require('./middleware/error-handler');
const routes = require('./routes');

const app = express();

// View engine
app.engine('ejs', require('ejs-mate'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use(routes);

// Error handling (must be last)
app.use(errorHandler.notFound);
app.use(errorHandler.serverError);

module.exports = app;
