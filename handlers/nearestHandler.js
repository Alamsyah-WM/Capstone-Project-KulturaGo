const { getNearestDummy } = require('../dummy/nearestDummy');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius Bumi dalam kilometer

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Hasil jarak dalam kilometer
};

const getNearest = async (request, h) => {
    try {
        const { lat, lon } = request.payload; 

        if (!lat || !lon) {
            return h.response({
                status: 'fail',
                message: 'Latitude and longitude are required',
            }).code(400);
        }

        const places = getNearestDummy();
        const placesWithDistance = places.map((place) => ({
            ...place,
            distance: haversineDistance(lat, lon, place.lat, place.lon),
        }));

        const sortedPlaces = placesWithDistance.sort((a, b) => a.distance - b.distance);
        const nearestPlaces = sortedPlaces.slice(0, 10);

        return h.response({
            status: 'success',
            data: nearestPlaces,
        }).code(200);
    } catch (error) {
        return h.response({
            status: 'fail',
            message: error.message,
        }).code(500);
    }
};

module.exports = {
    getNearest,
};
