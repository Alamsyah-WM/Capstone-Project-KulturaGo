const tf = require('@tensorflow/tfjs-node');


async function predictRecommendation(model, keyword) {
  const tensor = tf.tensor([[keyword]]);

  // Lakukan prediksi
  const prediction = model.predict(tensor);

  // Ambil hasil prediksi yang berupa nama tempat
  const places = await prediction.data(); 

  // Mengembalikan nama tempat yang diprediksi
  return places[0];  
}

module.exports = predictRecommendation;
