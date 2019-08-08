const mongoose = require("mongoose");

// DB Config
const db = require("../config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true }).then(
  () => { console.log("MongoDB successfully connected") },
  err => { console.log(err) }
);

// assign and use user routes
require('./User.js');
