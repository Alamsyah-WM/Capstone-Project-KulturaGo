const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    try {
        const model = await tf.loadLayersModel(process.env.MODEL_URL);
        console.log('Model berhasil dimuat');
        return model;
    } catch (error) {
        console.error('Error saat memuat model:', error);
        return null;
    }
}

module.exports = loadModel;