const recommendationDummy = require('../dummy/recommendationDummy');
const { preferenceDummy } = require('../dummy/preferenceDummy');
const { nanoid } = require('nanoid');

const addPreferences = async (request, h) => {
  const id = nanoid(16);
  const { category } = request.payload;

  if (!category || !Array.isArray(category) || category.length === 0) {
    return h.response({
      status: 'fail',
      message: 'Kategori harus berupa array dan tidak boleh kosong',
    }).code(400);
  }

  const newPreference = {
    id,
    category,
  };

  preferenceDummy.push(newPreference);

  const response = h.response({
    status: 'success',
    message: 'Preference berhasil ditambahkan',
    data: {
      preferenceId: id,
    },
  });
  response.code(201);
  return response;
};


const getRecommendations = async (request, h) => {
  try {
    const data = recommendationDummy.getDummy();
    return h.response({
      status: 'success',
      data,
    }).code(200);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message,
    }).code(500);
  }
};

module.exports = {
  getRecommendations,addPreferences,
};
