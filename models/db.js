const mongoose = require("mongoose");

// DB Config
const dbURI = process.env.CURIODBURI;

// Connect to MongoDB
//prettier-ignore
mongoose.connect(dbURI, { useNewUrlParser: true }).then(
  () => { console.log("MongoDB successfully connected") },
  err => { console.log(err) }
);

require("./User.js");
require("./Artefact.js");
require("./Group.js");
require("./Comment.js");
require("./Notification.js");
