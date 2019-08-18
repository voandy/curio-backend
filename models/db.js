const mongoose = require("mongoose");

// DB Config
const dbURI = process.env.CURIODBURI;

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true }).then(
  () => { console.log("MongoDB successfully connected") },
  err => { console.log(err) }
);

require('./User.js');
require('./Artefact.js');
require('./Collection.js');
require('./Comment.js');
