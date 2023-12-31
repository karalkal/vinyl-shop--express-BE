const express = require('express');
const app = express();

// extra security
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const bodyParser = require('body-parser');
const morgan = require('morgan')

require('dotenv').config()

const parentRouter = require('./routers/parentRouter');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const PORT = process.env.PORT || 3000;

require("express-async-errors");

app.set('trust proxy', 1)       // needed when deployed to heroku
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    }))

// Logging
app.use(morgan('dev'));

// bodyParser
app.use(bodyParser.json());

// Mount apiRouter at the '/api' path.
app.use("/api/v1", parentRouter);

// error handlers
// This middleware must be mounted at the very bottom of the call stack, after all the other declarations
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(PORT, console.log("I'm all ears at port", PORT))


module.exports = app;
