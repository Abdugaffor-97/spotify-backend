const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

const app = express();

const whiteList = [process.env.FE_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
// app.use(passport.initialize())

// ERROR HANDLERS
app.use(notFoundHandler);
app.use(forbiddenHandler);
app.use(badRequestHandler);
app.use(genericErrorHandler);

console.log(listEndpoints);

const port = process.env.PORT || 3004;
const mongo_connection = process.env.MONGO_CONNECTION;

mongoose
  .connect(mongo_connection, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(app.listen(port, () => console.log(port)))
  .catch((error) => console.log(err));
