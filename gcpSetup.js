var fs=require('fs');
fs.writeFile('services/gcs/gcs-keyfile.json', process.env.GCP_CRED, (err) => {});
