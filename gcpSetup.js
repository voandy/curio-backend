const fs = require('fs');

const path = 'services/gcs/gcs-keyfile.json';

fs.access(path, fs.F_OK, (err) => {
  if (err) {
    fs.writeFile('services/gcs/gcs-keyfile.json', process.env.GCP_CRED, (err) => {});
    console.log("Created GCS key file from enviroment variable.")
    return;
  }
  console.log("GCS keyfile already exists.");
});