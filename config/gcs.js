const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  keyFilename: './firebase-key.json', // Ganti dengan jalur ke file kredensial
  projectId: process.env.GCP_PROJECT_ID, // Ganti dengan ID proyek Google Cloud Anda
});

module.exports = storage;
