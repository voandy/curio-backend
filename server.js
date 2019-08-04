const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// assign and use user routes
const userRoutes = require("./routes/api/User");
app.use('/api/user', userRoutes);

// listen
const port = process.env.PORT || 5001;
app.listen(port, function(){
    console.log("Listening on port " + port);
});