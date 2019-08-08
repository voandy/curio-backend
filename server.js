const express = require('express');
const bodyParser = require("body-parser");

const app = express();

// connect to MongoDB Atlas
require('./models/db.js');

// routes setup
const userRoutes = require("./routes/user-routes.js");

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
app.use(bodyParser.json());

app.use('/api', userRoutes);

// listen
const port = process.env.PORT || 5001;
app.listen(port, function(){
    console.log("Listening on port " + port);
});
