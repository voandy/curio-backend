const express = require('express');
const router = express.Router();

const Multer = require('multer');
const imgUpload = require('../services/gcs/img-upload.js');

// Handles the multipart/form-data
const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
});

// uploads to GCS and sends a JSON object with the image URL
router.post('/img-upload', multer.single('image'), imgUpload.uploadToGcs, function(request, response, next) {
  const data = request.body;
  if (request.file && request.file.cloudStoragePublicUrl) {
    data.imageUrl = request.file.cloudStoragePublicUrl;
  }
  response.send(data);
})

module.exports = router;
