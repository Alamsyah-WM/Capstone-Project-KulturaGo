const predictRecommendation = require('../models/inferenceService');
const { BigQuery } = require('@google-cloud/bigquery');
const crypto = require('crypto');
const bigquery = new BigQuery({
  keyFilename: './serviceaccountkey.json', // Ganti dengan lokasi file kredensial Anda
});

async function postPredictHandler(request, h) {
  const { keyword } = request.payload;  // Terima keyword dari body request

  if (!keyword || typeof keyword !== 'string') {
    return h.response({
      status: 'fail',
      message: 'Keyword harus berupa string dan tidak boleh kosong.',
    }).code(400);
  }

  const { model } = request.server.app;
  
  // Prediksi nama tempat berdasarkan keyword
  const predictedPlace = await predictRecommendation(model, keyword);

  // Query ke BigQuery untuk mendapatkan data berdasarkan nama tempat yang diprediksi
  const query = `
    SELECT 
      id, nama, image_link, trans_desc
    FROM 
      \`kulturago-capstone.kulturago_data.cultural_place\` 
    WHERE 
      nama = @place
    LIMIT 5;
  `;

  const options = {
    query,
    params: { place: predictedPlace },
  };

  try {
    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: `Tidak ada data untuk tempat '${predictedPlace}'.`,
      }).code(404);
    }

    // Format hasil rekomendasi
    const recommendations = rows.map((row) => ({
      place_name: row.nama,
      description: row.trans_desc,
      location: row.location,
    }));

    // Buat respons lengkap
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const responseData = {
      id,
      keyword,
      predictedPlace,
      recommendations,
      createdAt,
    };

    return h.response({
      status: 'success',
      data: responseData,
    }).code(200);
  } catch (error) {
    console.error('Error executing query:', error);
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan saat mengambil data rekomendasi.',
    }).code(500);
  }
}

module.exports = postPredictHandler;
