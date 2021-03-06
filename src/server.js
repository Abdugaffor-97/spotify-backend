const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const api = require("./api");
const passport = require("passport");
const oauth = require("./auth/oauth");

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
app.use(passport.initialize());

app.use("/api", api);

// ERROR HANDLERS
app.use(notFoundHandler);
app.use(forbiddenHandler);
app.use(badRequestHandler);
app.use(genericErrorHandler);

console.log(listEndpoints(app));

const port = process.env.PORT || 3001;
const mongo_connection = process.env.MONGO_CONNECTION;

mongoose
  .connect(mongo_connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(app.listen(port, () => console.log("PORT", port)))
  .catch((error) => console.log(error));
