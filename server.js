// read in .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const port = process.env.PORT || 7000;

const app = express();

// connect to MongoDB Atlas
require("./models/db.js");

// routes setup
const imageRoutes = require("./routes/image-routes.js");
const userRoutes = require("./routes/user-routes.js");
const artefactRoutes = require("./routes/artefact-routes.js");
const groupRoutes = require("./routes/group-routes.js");
const commentRoutes = require("./routes/comment-routes.js");

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Welcome to Curio!");
});

app.use("/api", imageRoutes);
app.use("/api", userRoutes);
app.use("/api", artefactRoutes);
app.use("/api", groupRoutes);
app.use("/api", commentRoutes);

// listen
app.listen(port, function() {
  console.log("Listening on port " + port);
});

const expoHandler = require("./services/notification/expo-handler");
expoHandler.run();
