const mostVisitedDummy = require('../dummy/mostVisitedDummy');

const getMostVisited = async (request, h) => {
  try {
    const data = mostVisitedDummy.getMostVisitedDummy();
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
  getMostVisited,
};
