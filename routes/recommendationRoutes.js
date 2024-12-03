const { getRecommendation, savePreference, saveRecommendation, getRecommendationFromFirestore } = require('../handlers/recommendationHandler');
  
  const recommendationRoutes = [
    {
      method: 'POST',
      path: '/recommendation',
      handler: async (request, h) => {
        const { uid, preference } = request.payload;
  
        try {
          // Simpan preferensi user ke Firestore
          await savePreference(uid, preference);
  
          // Dapatkan rekomendasi dari model
          const recommendation = await getRecommendation(preference);
  
          // Simpan rekomendasi ke Firestore (dengan UID user)
          await saveRecommendation(uid, recommendation);
  
          // Kirim rekomendasi sebagai response
          return h.response({
            message: 'Recommendation generated and saved successfully!',
            recommendation,
          }).code(200);
  
        } catch (error) {
          return h.response({ error: error.message }).code(500);
        }
      },
    },
    {
      method: 'GET',
      path: '/recommendation/{uid}',
      handler: async (request, h) => {
        const { uid } = request.params;
  
        try {
          // Ambil rekomendasi user dari Firestore
          const recommendation = await getRecommendationFromFirestore(uid);
  
          return h.response({
            message: 'Recommendation fetched successfully!',
            recommendation,
          }).code(200);
        } catch (error) {
          return h.response({ error: error.message }).code(500);
        }
      },
    }
  ];
  
  module.exports = recommendationRoutes;
  