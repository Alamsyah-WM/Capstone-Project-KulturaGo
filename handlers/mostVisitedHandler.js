const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery({
  keyFilename: './serviceaccountkey.json', // Ganti dengan lokasi file kredensial Anda
});

const getMostVisited = async (request, h) => {
  const query = `
    SELECT \`no\`, nama, description, types, image_link
    FROM \`kulturago-capstone.kulturago_data.cultural_place\`
    LIMIT 3
  `;
  
  try {
    const [rows] = await bigquery.query(query);
    if (rows.length === 0) {
      return h.response({ error: 'Place not found' }).code(404); // Jika tidak ada hasil
    }
    return h.response(rows).code(200);  
  } catch (error) {
    console.error('Error querying BigQuery: ', error);
    return h.response({ error: 'Error fetching data from BigQuery' }).code(500);
  }
};

module.exports = { getMostVisited };

