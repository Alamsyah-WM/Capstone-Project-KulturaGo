const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery({
  keyFilename: './serviceaccountkey.json', // Ganti dengan lokasi file kredensial Anda
});

const getPlaceById = async (request, h) => {
  const id = parseInt(request.params.id);

  const query = `
    SELECT nama, htm_weekday, htm_weekend, latitude, longitude, description, types, image_link
    FROM \`kulturago-capstone.kulturago_data.cultural_place\`
    WHERE \`no\` = @id
  `;

  const options = {
    query: query,
    params: { id: id },  
  };
  
  try {
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return h.response({ error: 'Place not found' }).code(404); // Jika tidak ada hasil
    }
    return h.response(rows[0]).code(200);  // Mengirimkan detail tempat berdasarkan ID
  } catch (error) {
    console.error('Error querying BigQuery: ', error);
    return h.response({ error: 'Error fetching data from BigQuery' }).code(500);
  }
};

module.exports = { getPlaceById };
