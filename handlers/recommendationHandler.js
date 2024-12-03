const firestore = require('../config/firestore');  // Pastikan sudah ada inisialisasi Firestore
const storage = require('../config/gcs');
const tf = require('@tensorflow/tfjs-node');

const downloadModelFromGCS = async (bucketName, modelName, localPath) => {
    const bucket = storage.bucket(bucketName);
  
    const file = bucket.file(modelName);
    const destination = localPath || `./temp/${modelName}`;
  
    try {
      await file.download({ destination });
      console.log(`Model downloaded to ${destination}`);
      return destination;
    } catch (error) {
      throw new Error(`Failed to download model: ${error.message}`);
    }
  };

// Simpan preferensi pengguna ke Firestore
const savePreference = async (uid, preference) => {
  try {
    const userRef = firestore.collection('userPreferences').doc(uid);
    await userRef.set({ preference });
    console.log(`Preference for user ${uid} saved.`);
  } catch (error) {
    throw new Error(`Failed to save preference: ${error.message}`);
  }
};

const saveRecommendation = async (uid, recommendation) => {
    try {
      const recommendationRef = firestore.collection('userRecommendations').doc(uid);
      await recommendationRef.set({ recommendation });
      console.log(`Recommendation for user ${uid} saved.`);
    } catch (error) {
      throw new Error(`Failed to save recommendation: ${error.message}`);
    }
  };
  

// Mengambil preferensi pengguna dari Firestore
const getUserPreference = async (uid) => {
  try {
    const userRef = firestore.collection('userPreferences').doc(uid);
    const doc = await userRef.get();
    if (doc.exists) {
      return doc.data().preference;
    } else {
      throw new Error(`No preference found for user ${uid}`);
    }
  } catch (error) {
    throw new Error(`Failed to get preference: ${error.message}`);
  }
};

const getRecommendation = async (preference) => {
  try {
    const bucketName = 'kulturago-descplace'; // Ganti dengan nama bucket Anda
    const modelName = 'capstone_model.h5'; // Nama file model di GCS

    const modelPath = await downloadModelFromGCS(bucketName, modelName);

    // Muat model TensorFlow
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Model loaded successfully.');

    // Simulasi input data
    const inputTensor = tf.tensor([preference], [1, preference.length]);

    // Prediksi rekomendasi
    const prediction = model.predict(inputTensor);
    const recommendation = prediction.dataSync(); // Atur sesuai output model Anda

    return recommendation;
  } catch (error) {
    throw new Error(`Failed to generate recommendation: ${error.message}`);
  }
};

module.exports = { savePreference, saveRecommendation, getUserPreference, getRecommendation };
