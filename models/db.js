const mongoose = require("mongoose");

// DB Config
const db = require("../config/secret_keys.js").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true }).then(
  () => { console.log("MongoDB successfully connected") },
  err => { console.log(err) }
);

require('./User.js');
require('./Artefact.js');
