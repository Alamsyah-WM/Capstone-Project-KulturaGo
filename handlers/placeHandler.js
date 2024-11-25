const placeDummy = require('../dummy/placeDummy');

const getPlace = async (request, h) => {
  try {
    const data = placeDummy.getPlacesDummy();
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
  getPlace,
};
